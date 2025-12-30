-- ============================================
-- NOTIFICATION SYSTEM DATABASE SCHEMA
-- Queue-based, idempotent, platform-agnostic
-- ============================================

-- ============================================
-- 1. NOTIFICATION PREFERENCES
-- Per-user settings with global master toggle
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Global master toggle (overrides all other settings)
    notifications_enabled BOOLEAN DEFAULT true,
    
    -- Chat notification mode: 'all' | 'mentions' | 'mute'
    chat_mode TEXT DEFAULT 'all' CHECK (chat_mode IN ('all', 'mentions', 'mute')),
    
    -- Category toggles
    team_activity BOOLEAN DEFAULT true,
    task_updates BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    account_security BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
    ON public.notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
    ON public.notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
    ON public.notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Auto-create preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON auth.users;
CREATE TRIGGER trigger_create_notification_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_notification_preferences();


-- ============================================
-- 2. NOTIFICATION QUEUE
-- Decoupled delivery with idempotency
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Idempotency key (prevents duplicate notifications)
    event_hash TEXT UNIQUE NOT NULL,
    
    -- Target user
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification type for preference checking
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'chat_message', 
        'chat_mention', 
        'team_activity', 
        'task_update', 
        'system_alert', 
        'account_security'
    )),
    
    -- Payload (never empty)
    title TEXT NOT NULL DEFAULT 'SpireTrack',
    body TEXT NOT NULL,
    url TEXT DEFAULT '/app',
    data JSONB DEFAULT '{}',
    
    -- Processing state
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    attempts INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending 
    ON public.notification_queue(status, created_at) 
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_notification_queue_user 
    ON public.notification_queue(user_id, created_at DESC);

-- RLS for notification_queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Service role can manage queue
CREATE POLICY "Service role can manage notification queue"
    ON public.notification_queue FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notification_queue FOR SELECT
    USING (auth.uid() = user_id);


-- ============================================
-- 3. UPDATE PUSH_SUBSCRIPTIONS
-- Add platform-agnostic delivery type
-- ============================================
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'web' 
CHECK (delivery_type IN ('web', 'ios', 'android'));


-- ============================================
-- 4. QUEUE NOTIFICATION FUNCTION
-- Called by triggers to add to queue
-- ============================================
CREATE OR REPLACE FUNCTION public.queue_chat_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
    v_channel_name TEXT;
    v_sender_name TEXT;
    v_message_preview TEXT;
    v_mentioned_users UUID[];
    v_team_member RECORD;
    v_event_hash TEXT;
    v_timestamp_bucket TEXT;
BEGIN
    -- Get channel and team info (team_messages uses channel_id)
    SELECT c.team_id, c.name INTO v_team_id, v_channel_name
    FROM public.team_channels c
    WHERE c.id = NEW.channel_id;
    
    -- Get sender name
    SELECT COALESCE(u.full_name, u.email, 'Someone') INTO v_sender_name
    FROM public.users u
    WHERE u.id = NEW.user_id;
    
    -- Create message preview (max 100 chars)
    v_message_preview := LEFT(NEW.content, 100);
    IF LENGTH(NEW.content) > 100 THEN
        v_message_preview := v_message_preview || '...';
    END IF;
    
    -- Extract @mentions from message (matches @username pattern)
    -- Format: array of user IDs that were mentioned
    SELECT ARRAY_AGG(DISTINCT u.id) INTO v_mentioned_users
    FROM public.users u
    WHERE NEW.content ILIKE '%@' || u.username || '%'
       OR NEW.content ILIKE '%@' || u.full_name || '%';
    
    -- Timestamp bucket for idempotency (1-minute granularity)
    v_timestamp_bucket := to_char(NEW.created_at, 'YYYY-MM-DD"T"HH24:MI');
    
    -- Queue notifications for each team member (except sender)
    FOR v_team_member IN
        SELECT tm.user_id
        FROM public.team_members tm
        WHERE tm.team_id = v_team_id
          AND tm.user_id != NEW.user_id
          AND tm.status != 'banned'
    LOOP
        -- Create unique event hash for idempotency
        v_event_hash := 'chat:' || NEW.id || ':' || v_team_member.user_id || ':' || v_timestamp_bucket;
        
        -- Check if user is mentioned
        IF v_mentioned_users IS NOT NULL AND v_team_member.user_id = ANY(v_mentioned_users) THEN
            -- User is mentioned - ONLY send mention notification (not both)
            INSERT INTO public.notification_queue (
                event_hash,
                user_id,
                notification_type,
                title,
                body,
                url,
                data
            ) VALUES (
                v_event_hash,
                v_team_member.user_id,
                'chat_mention',
                v_sender_name || ' mentioned you',
                v_message_preview,
                '/app/team/' || v_team_id || '/chat/' || NEW.channel_id,
                jsonb_build_object(
                    'team_id', v_team_id,
                    'channel_id', NEW.channel_id,
                    'message_id', NEW.id,
                    'channel_name', v_channel_name
                )
            )
            ON CONFLICT (event_hash) DO NOTHING;
        ELSE
            -- User is NOT mentioned - send regular chat message notification
            INSERT INTO public.notification_queue (
                event_hash,
                user_id,
                notification_type,
                title,
                body,
                url,
                data
            ) VALUES (
                v_event_hash,
                v_team_member.user_id,
                'chat_message',
                v_channel_name || ' • ' || v_sender_name,
                v_message_preview,
                '/app/team/' || v_team_id || '/chat/' || NEW.channel_id,
                jsonb_build_object(
                    'team_id', v_team_id,
                    'channel_id', NEW.channel_id,
                    'message_id', NEW.id,
                    'channel_name', v_channel_name
                )
            )
            ON CONFLICT (event_hash) DO NOTHING;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 5. TRIGGER ON CHANNEL MESSAGES
-- ============================================
DROP TRIGGER IF EXISTS trigger_queue_chat_notification ON public.team_messages;
CREATE TRIGGER trigger_queue_chat_notification
    AFTER INSERT ON public.team_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.queue_chat_notification();


-- ============================================
-- 6. COMMENTS
-- ============================================
COMMENT ON TABLE public.notification_preferences IS 'Per-user notification settings with global master toggle';
COMMENT ON TABLE public.notification_queue IS 'Decoupled notification queue for reliable delivery with idempotency';
COMMENT ON FUNCTION public.queue_chat_notification IS 'Queues chat notifications, handles mentions vs regular messages';

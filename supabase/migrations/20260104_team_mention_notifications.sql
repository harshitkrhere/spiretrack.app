-- ============================================
-- ADD @TEAM MENTION NOTIFICATION SUPPORT
-- When admins use @team, all team members get notified
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
    v_is_team_mention BOOLEAN;
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
    
    -- Check for @team mention (case-insensitive)
    v_is_team_mention := NEW.content ILIKE '%@team%';
    
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
        
        -- Check if @team was used OR if user is specifically mentioned
        IF v_is_team_mention THEN
            -- @team mention - notify ALL team members as mention notification
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
                v_sender_name || ' mentioned @team',
                v_message_preview,
                '/app/team/' || v_team_id || '/chat/' || NEW.channel_id,
                jsonb_build_object(
                    'team_id', v_team_id,
                    'channel_id', NEW.channel_id,
                    'message_id', NEW.id,
                    'channel_name', v_channel_name,
                    'is_team_mention', true
                )
            )
            ON CONFLICT (event_hash) DO NOTHING;
        ELSIF v_mentioned_users IS NOT NULL AND v_team_member.user_id = ANY(v_mentioned_users) THEN
            -- User is individually mentioned
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

-- Update comment
COMMENT ON FUNCTION public.queue_chat_notification IS 'Queues chat notifications, handles @team mentions and @username mentions';

-- =====================================================
-- PHASE 2: Business-Grade Reliability & Adoption
-- Migration: Notifications + Team Activity Logs
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- In-app notification storage for mentions, invites, reports, reminders
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('mention', 'team_invite', 'report_ready', 'reminder', 'system')),
  title text NOT NULL,
  body text,
  link text, -- URL to navigate to when clicked
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional context (team_id, message_id, etc.)
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Handled by Edge Functions with service role

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());


-- =====================================================
-- 2. TEAM ACTIVITY LOGS TABLE
-- Audit trail for team actions (admin-visible, read-only)
-- 90-day retention policy
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN (
    'member_joined', 
    'member_left', 
    'member_removed',
    'role_changed',
    'report_generated',
    'form_updated',
    'settings_changed',
    'channel_created',
    'channel_deleted'
  )),
  details jsonb DEFAULT '{}'::jsonb, -- Action-specific data
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_team ON public.team_activity_logs(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.team_activity_logs(actor_id);

-- Enable RLS
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only team admins can view activity logs
DROP POLICY IF EXISTS "Team admins can view activity logs" ON public.team_activity_logs;
CREATE POLICY "Team admins can view activity logs" ON public.team_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = public.team_activity_logs.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = public.team_activity_logs.team_id
      AND t.created_by = auth.uid()
    )
  );

-- System/Edge Functions can insert logs
DROP POLICY IF EXISTS "System can insert activity logs" ON public.team_activity_logs;
CREATE POLICY "System can insert activity logs" ON public.team_activity_logs
  FOR INSERT WITH CHECK (true);


-- =====================================================
-- 3. HELPER FUNCTION: Log Team Activity
-- Called by triggers and Edge Functions
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_team_activity(
  p_team_id uuid,
  p_actor_id uuid,
  p_action text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.team_activity_logs (team_id, actor_id, action, details)
  VALUES (p_team_id, p_actor_id, p_action, p_details);
END;
$$;


-- =====================================================
-- 4. HELPER FUNCTION: Create Notification
-- Called by Edge Functions for various notification types
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_link text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;


-- =====================================================
-- 5. CLEANUP FUNCTION: 90-day Activity Log Retention
-- Schedule via pg_cron or run manually
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.team_activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Schedule cleanup (if pg_cron is available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-activity-logs',
      '0 2 * * *', -- Run daily at 2 AM
      'SELECT public.cleanup_old_activity_logs()'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if pg_cron not available
END $$;


-- =====================================================
-- 6. TRIGGER: Auto-log member join/leave events
-- =====================================================

CREATE OR REPLACE FUNCTION public.trigger_log_member_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_team_activity(
      NEW.team_id,
      NEW.user_id,
      'member_joined',
      jsonb_build_object('role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_team_activity(
      OLD.team_id,
      OLD.user_id,
      'member_left',
      jsonb_build_object('role', OLD.role)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trg_log_member_changes ON public.team_members;
CREATE TRIGGER trg_log_member_changes
  AFTER INSERT OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.trigger_log_member_changes();

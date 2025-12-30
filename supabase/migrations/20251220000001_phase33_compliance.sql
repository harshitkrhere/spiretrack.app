-- =====================================================
-- PHASE 3.3: Compliance, Accountability & Operational Assurance
-- Migration: Deadlines, Acknowledgements, Escalations, Activity Trails
-- =====================================================

-- =====================================================
-- 1. TEAM REVIEW SETTINGS (Deadline Configuration)
-- Admin-configurable deadline enforcement per team
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_review_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL UNIQUE,
  submission_deadline_day integer CHECK (submission_deadline_day BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
  submission_deadline_time time DEFAULT '18:00:00',
  late_submission_allowed boolean DEFAULT true,
  lock_after_deadline boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient team lookup
CREATE INDEX IF NOT EXISTS idx_team_review_settings_team ON public.team_review_settings(team_id);

-- Enable RLS
ALTER TABLE public.team_review_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Team members can view, admins can manage
DROP POLICY IF EXISTS "Team members can view review settings" ON public.team_review_settings;
CREATE POLICY "Team members can view review settings" ON public.team_review_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_review_settings.team_id
      AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team admins can manage review settings" ON public.team_review_settings;
CREATE POLICY "Team admins can manage review settings" ON public.team_review_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_review_settings.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_review_settings.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  );


-- =====================================================
-- 2. EXTEND WEEKLY_REVIEWS (Submission Status & Locking)
-- Track on-time/late/missed status and locking
-- =====================================================

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS submission_status text DEFAULT 'on_time' 
    CHECK (submission_status IN ('on_time', 'late', 'missed'));

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_status ON public.weekly_reviews(team_id, submission_status);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_locked ON public.weekly_reviews(is_locked) WHERE is_locked = true;


-- =====================================================
-- 3. EXTEND READ_RECEIPTS (Acknowledgement Support)
-- Add explicit acknowledgement for critical content
-- =====================================================

ALTER TABLE public.read_receipts
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz;

-- Update entity_type check to include decision
DO $$
BEGIN
  ALTER TABLE public.read_receipts DROP CONSTRAINT IF EXISTS read_receipts_entity_type_check;
  ALTER TABLE public.read_receipts ADD CONSTRAINT read_receipts_entity_type_check 
    CHECK (entity_type IN ('report', 'announcement', 'overview', 'decision'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;


-- =====================================================
-- 4. EXTEND ANNOUNCEMENTS (Requires Acknowledgement)
-- Admin can mark announcements as requiring sign-off
-- =====================================================

ALTER TABLE public.channel_announcements
  ADD COLUMN IF NOT EXISTS requires_acknowledgement boolean DEFAULT false;

ALTER TABLE public.channel_announcements
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Default owner to creator for existing announcements
UPDATE public.channel_announcements
SET owner_id = created_by
WHERE owner_id IS NULL AND created_by IS NOT NULL;


-- =====================================================
-- 5. EXTEND DECISIONS (Requires Acknowledgement)
-- Admin can mark decisions as requiring sign-off
-- =====================================================

ALTER TABLE public.channel_decisions
  ADD COLUMN IF NOT EXISTS requires_acknowledgement boolean DEFAULT false;

ALTER TABLE public.channel_decisions
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Default owner to decided_by for existing decisions
UPDATE public.channel_decisions
SET owner_id = decided_by
WHERE owner_id IS NULL AND decided_by IS NOT NULL;


-- =====================================================
-- 6. ESCALATION RECORDS TABLE
-- Track operational risks and escalations
-- =====================================================

CREATE TABLE IF NOT EXISTS public.escalation_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('review', 'task', 'decision', 'announcement')),
  entity_id uuid NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  trigger_type text NOT NULL, -- e.g. 'missed_deadline', 'unacknowledged', 'overdue_task'
  trigger_date timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_escalations_team ON public.escalation_records(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_severity ON public.escalation_records(severity);
CREATE INDEX IF NOT EXISTS idx_escalations_unresolved ON public.escalation_records(team_id) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_escalations_entity ON public.escalation_records(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.escalation_records ENABLE ROW LEVEL SECURITY;

-- RLS: Only team admins can view escalations
DROP POLICY IF EXISTS "Team admins can view escalations" ON public.escalation_records;
CREATE POLICY "Team admins can view escalations" ON public.escalation_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = escalation_records.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.team_member_roles tmr
      JOIN public.team_roles tr ON tr.id = tmr.role_id
      WHERE tmr.team_id = escalation_records.team_id
      AND tmr.user_id = auth.uid()
      AND tr.is_admin = true
    )
  );

-- System can insert escalations
DROP POLICY IF EXISTS "System can insert escalations" ON public.escalation_records;
CREATE POLICY "System can insert escalations" ON public.escalation_records
  FOR INSERT WITH CHECK (true);

-- Admins can update (resolve) escalations
DROP POLICY IF EXISTS "Admins can resolve escalations" ON public.escalation_records;
CREATE POLICY "Admins can resolve escalations" ON public.escalation_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = escalation_records.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
  );


-- =====================================================
-- 7. EXTEND TEAM_ACTIVITY_LOGS (Audit Trail Enhancement)
-- Track before/after states for compliance
-- =====================================================

-- Extend action types if needed
DO $$
BEGIN
  ALTER TABLE public.team_activity_logs DROP CONSTRAINT IF EXISTS team_activity_logs_action_check;
  ALTER TABLE public.team_activity_logs ADD CONSTRAINT team_activity_logs_action_check 
    CHECK (action IN (
      'member_joined', 
      'member_left', 
      'member_removed',
      'role_changed',
      'report_generated',
      'form_updated',
      'settings_changed',
      'channel_created',
      'channel_deleted',
      'ownership_changed',
      'locked',
      'unlocked',
      'deadline_changed',
      'acknowledged'
    ));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;


-- =====================================================
-- 8. HELPER FUNCTION: Acknowledge Entity
-- Records explicit acknowledgement
-- =====================================================

CREATE OR REPLACE FUNCTION public.acknowledge_entity(
  p_entity_type text,
  p_entity_id uuid,
  p_team_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_receipt_id uuid;
BEGIN
  -- Insert or update read receipt with acknowledgement
  INSERT INTO public.read_receipts (user_id, entity_type, entity_id, team_id, acknowledged_at)
  VALUES (auth.uid(), p_entity_type, p_entity_id, p_team_id, now())
  ON CONFLICT (user_id, entity_type, entity_id) 
  DO UPDATE SET acknowledged_at = now()
  WHERE read_receipts.acknowledged_at IS NULL -- Only update if not already acknowledged
  RETURNING id INTO v_receipt_id;
  
  -- Log the acknowledgement action
  INSERT INTO public.team_activity_logs (team_id, actor_id, action, details)
  VALUES (
    p_team_id, 
    auth.uid(), 
    'acknowledged',
    jsonb_build_object(
      'entity_type', p_entity_type,
      'entity_id', p_entity_id
    )
  );
  
  RETURN v_receipt_id IS NOT NULL;
END;
$$;


-- =====================================================
-- 9. HELPER FUNCTION: Lock Weekly Review
-- Auto-lock with audit logging
-- =====================================================

CREATE OR REPLACE FUNCTION public.lock_weekly_review(p_review_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
  v_before_state jsonb;
BEGIN
  -- Get team_id and current state
  SELECT team_id, jsonb_build_object('is_locked', is_locked, 'locked_at', locked_at)
  INTO v_team_id, v_before_state
  FROM public.weekly_reviews WHERE id = p_review_id;
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Lock the review
  UPDATE public.weekly_reviews 
  SET is_locked = true, locked_at = now(), locked_by = auth.uid()
  WHERE id = p_review_id;
  
  -- Log the action with before/after state
  INSERT INTO public.team_activity_logs (team_id, actor_id, action, details)
  VALUES (
    v_team_id, 
    auth.uid(), 
    'locked',
    jsonb_build_object(
      'entity_type', 'review',
      'entity_id', p_review_id,
      'before_state', v_before_state,
      'after_state', jsonb_build_object('is_locked', true, 'locked_at', now())
    )
  );
  
  RETURN true;
END;
$$;


-- =====================================================
-- 10. HELPER FUNCTION: Get Acknowledgement Stats
-- Returns who has acknowledged vs pending
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_acknowledgement_stats(
  p_entity_type text,
  p_entity_id uuid,
  p_team_id uuid
)
RETURNS TABLE (
  total_members bigint,
  acknowledged_count bigint,
  pending_count bigint,
  acknowledged_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id)::bigint as total_members,
    (SELECT COUNT(*) FROM public.read_receipts 
     WHERE entity_type = p_entity_type 
     AND entity_id = p_entity_id 
     AND team_id = p_team_id
     AND acknowledged_at IS NOT NULL)::bigint as acknowledged_count,
    ((SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id) -
     (SELECT COUNT(*) FROM public.read_receipts 
      WHERE entity_type = p_entity_type 
      AND entity_id = p_entity_id 
      AND team_id = p_team_id
      AND acknowledged_at IS NOT NULL))::bigint as pending_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.read_receipts 
         WHERE entity_type = p_entity_type 
         AND entity_id = p_entity_id 
         AND team_id = p_team_id
         AND acknowledged_at IS NOT NULL)::numeric / 
        (SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id)::numeric * 100, 
        1
      )
    END as acknowledged_percentage;
END;
$$;


-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.team_review_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_review_settings TO authenticated;

GRANT SELECT ON public.escalation_records TO authenticated;
GRANT INSERT, UPDATE ON public.escalation_records TO authenticated;

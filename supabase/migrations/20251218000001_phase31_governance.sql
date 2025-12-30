-- =====================================================
-- PHASE 3.1: Governance, Control & Enterprise Readiness
-- Migration: Locking + Read Receipts
-- =====================================================

-- =====================================================
-- 1. LOCKING FIELDS FOR TEAM CONSOLIDATED REPORTS
-- Prevents accidental or unauthorized changes after approval
-- =====================================================

ALTER TABLE public.team_consolidated_reports 
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

ALTER TABLE public.team_consolidated_reports 
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

ALTER TABLE public.team_consolidated_reports 
  ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for efficient filtering of locked reports
CREATE INDEX IF NOT EXISTS idx_team_reports_locked 
  ON public.team_consolidated_reports(team_id, is_locked) 
  WHERE is_locked = true;


-- =====================================================
-- 2. LOCKING FIELDS FOR TEAM FORMS
-- Once published, structure is locked (new versions only)
-- =====================================================

ALTER TABLE public.team_forms 
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

ALTER TABLE public.team_forms 
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;


-- =====================================================
-- 3. READ RECEIPTS TABLE
-- Track engagement for reports, announcements, overview updates
-- Lightweight, non-intrusive (admin-only visibility)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.read_receipts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('report', 'announcement', 'overview')),
  entity_id uuid NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate receipts
  UNIQUE(user_id, entity_type, entity_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_read_receipts_entity 
  ON public.read_receipts(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_read_receipts_team 
  ON public.read_receipts(team_id);

-- Enable RLS
ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can insert their own read receipts
DROP POLICY IF EXISTS "Users can mark items as read" ON public.read_receipts;
CREATE POLICY "Users can mark items as read" ON public.read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view read receipts for their team
DROP POLICY IF EXISTS "Team admins can view read receipts" ON public.read_receipts;
CREATE POLICY "Team admins can view read receipts" ON public.read_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = public.read_receipts.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = public.read_receipts.team_id
      AND t.created_by = auth.uid()
    )
  );


-- =====================================================
-- 4. HELPER FUNCTION: Mark Entity as Read
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_entity_read(
  p_entity_type text,
  p_entity_id uuid,
  p_team_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.read_receipts (user_id, entity_type, entity_id, team_id)
  VALUES (auth.uid(), p_entity_type, p_entity_id, p_team_id)
  ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING;
END;
$$;


-- =====================================================
-- 5. HELPER FUNCTION: Get Read Receipt Stats
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_read_receipt_stats(
  p_entity_type text,
  p_entity_id uuid,
  p_team_id uuid
)
RETURNS TABLE (
  total_members bigint,
  read_count bigint,
  read_percentage numeric
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
     AND team_id = p_team_id)::bigint as read_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.read_receipts 
         WHERE entity_type = p_entity_type 
         AND entity_id = p_entity_id 
         AND team_id = p_team_id)::numeric / 
        (SELECT COUNT(*) FROM public.team_members WHERE team_id = p_team_id)::numeric * 100, 
        1
      )
    END as read_percentage;
END;
$$;


-- =====================================================
-- 6. LOCK/UNLOCK FUNCTIONS FOR REPORTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.lock_team_report(p_report_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
BEGIN
  -- Get team_id from report
  SELECT team_id INTO v_team_id FROM public.team_consolidated_reports WHERE id = p_report_id;
  
  -- Check if user is admin/owner
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = v_team_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Only admins can lock reports';
  END IF;
  
  -- Lock the report
  UPDATE public.team_consolidated_reports 
  SET is_locked = true, locked_at = now(), locked_by = auth.uid()
  WHERE id = p_report_id;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_team_report(p_report_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id uuid;
BEGIN
  -- Get team_id from report
  SELECT team_id INTO v_team_id FROM public.team_consolidated_reports WHERE id = p_report_id;
  
  -- Check if user is admin/owner
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = v_team_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Only admins can unlock reports';
  END IF;
  
  -- Unlock the report
  UPDATE public.team_consolidated_reports 
  SET is_locked = false, locked_at = NULL, locked_by = NULL
  WHERE id = p_report_id;
  
  RETURN true;
END;
$$;

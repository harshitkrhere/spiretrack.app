-- =====================================================
-- PHASE 3.2: Collaboration Depth & Operational Alignment
-- =====================================================
-- Created: 2024-12-18
-- Purpose: Enable channel-level execution tracking,
--          decisions, announcements, and task traceability
-- =====================================================

-- 1. CHANNEL OWNERSHIP
-- Add explicit owner to channels (informational, not permission-changing)
-- =====================================================

ALTER TABLE public.team_channels
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- Default owner to creator for existing channels
UPDATE public.team_channels
SET owner_id = created_by
WHERE owner_id IS NULL AND created_by IS NOT NULL;

-- 2. TASK OWNERSHIP & TRACEABILITY
-- Add owner and origin tracking to tasks
-- =====================================================

ALTER TABLE public.team_tasks
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

ALTER TABLE public.team_tasks
ADD COLUMN IF NOT EXISTS linked_message_id uuid;

ALTER TABLE public.team_tasks
ADD COLUMN IF NOT EXISTS linked_report_id uuid;

-- Default owner to assignee for existing tasks
UPDATE public.team_tasks
SET owner_id = assigned_to
WHERE owner_id IS NULL AND assigned_to IS NOT NULL;

-- 3. CHANNEL DECISIONS TABLE (IMMUTABLE)
-- Permanent record of decisions made in channel
-- =====================================================

CREATE TABLE IF NOT EXISTS public.channel_decisions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id uuid REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  decided_at timestamptz DEFAULT now(),
  related_entities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_channel_decisions_channel 
  ON public.channel_decisions(channel_id, decided_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_decisions_team 
  ON public.channel_decisions(team_id);

-- 4. CHANNEL ANNOUNCEMENTS TABLE
-- Structured announcements separate from chat
-- =====================================================

CREATE TABLE IF NOT EXISTS public.channel_announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id uuid REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_channel_announcements_channel 
  ON public.channel_announcements(channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_announcements_team 
  ON public.channel_announcements(team_id);

-- 5. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.channel_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_announcements ENABLE ROW LEVEL SECURITY;

-- Decisions: Team members can read, admins can create
DROP POLICY IF EXISTS "Team members can view decisions" ON public.channel_decisions;
CREATE POLICY "Team members can view decisions" ON public.channel_decisions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = channel_decisions.team_id
      AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can create decisions" ON public.channel_decisions;
CREATE POLICY "Admins can create decisions" ON public.channel_decisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = channel_decisions.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.team_member_roles tmr
      JOIN public.team_roles tr ON tr.id = tmr.role_id
      WHERE tmr.team_id = channel_decisions.team_id
      AND tmr.user_id = auth.uid()
      AND tr.is_admin = true
    )
  );

-- No update/delete on decisions (immutable)

-- Announcements: Team members can read, admins can create
DROP POLICY IF EXISTS "Team members can view announcements" ON public.channel_announcements;
CREATE POLICY "Team members can view announcements" ON public.channel_announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = channel_announcements.team_id
      AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can create announcements" ON public.channel_announcements;
CREATE POLICY "Admins can create announcements" ON public.channel_announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = channel_announcements.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.team_member_roles tmr
      JOIN public.team_roles tr ON tr.id = tmr.role_id
      WHERE tmr.team_id = channel_announcements.team_id
      AND tmr.user_id = auth.uid()
      AND tr.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.channel_announcements;
CREATE POLICY "Admins can delete announcements" ON public.channel_announcements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = channel_announcements.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.team_member_roles tmr
      JOIN public.team_roles tr ON tr.id = tmr.role_id
      WHERE tmr.team_id = channel_announcements.team_id
      AND tmr.user_id = auth.uid()
      AND tr.is_admin = true
    )
  );

-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON public.channel_decisions TO authenticated;
GRANT INSERT ON public.channel_decisions TO authenticated;

GRANT SELECT ON public.channel_announcements TO authenticated;
GRANT INSERT, DELETE ON public.channel_announcements TO authenticated;

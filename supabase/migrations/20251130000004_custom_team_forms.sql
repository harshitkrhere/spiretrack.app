-- Custom Team Review Form Builder
-- Phase 1: Database Schema with Weekly Form Snapshots

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TABLE 1: team_forms (Live Form Questions)
-- =====================================================================
-- Stores the current/live custom questions defined by team admins.
-- Admins can edit these at any time, but changes only affect future weeks.

CREATE TABLE IF NOT EXISTS public.team_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'long_text', 'number', 'rating')),
  position INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, position)
);

CREATE INDEX IF NOT EXISTS idx_team_forms_team ON public.team_forms(team_id, position);

COMMENT ON TABLE public.team_forms IS 'Live custom review questions defined by team admins';
COMMENT ON COLUMN public.team_forms.position IS 'Display order (unique per team)';

-- =====================================================================
-- TABLE 2: team_form_snapshots (Weekly Immutable Snapshots)
-- =====================================================================
-- Immutable snapshots of form questions for each week.
-- Created automatically when the first member submits for a new week.
-- Ensures historical accuracy - past reports always use the exact questions from that week.

CREATE TABLE IF NOT EXISTS public.team_form_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  original_question_id UUID REFERENCES public.team_forms(id) ON DELETE SET NULL,
  snapshot_question_text TEXT NOT NULL,
  snapshot_question_type TEXT NOT NULL CHECK (snapshot_question_type IN ('text', 'long_text', 'number', 'rating')),
  snapshot_position INTEGER NOT NULL,
  is_required_at_snapshot BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, week_start, snapshot_position)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_team_week ON public.team_form_snapshots(team_id, week_start);
CREATE INDEX IF NOT EXISTS idx_snapshots_original_question ON public.team_form_snapshots(original_question_id);

COMMENT ON TABLE public.team_form_snapshots IS 'Immutable weekly snapshots of team form questions';
COMMENT ON COLUMN public.team_form_snapshots.week_start IS 'Week this snapshot applies to (Monday)';
COMMENT ON COLUMN public.team_form_snapshots.original_question_id IS 'Reference to original question (nullable if deleted)';

-- =====================================================================
-- TABLE 3: team_member_form_responses (Member Answers)
-- =====================================================================
-- Stores member answers for each week, referencing the snapshot questions.

CREATE TABLE IF NOT EXISTS public.team_member_form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  snapshot_question_id UUID REFERENCES public.team_form_snapshots(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT,
  answer_number NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id, week_start, snapshot_question_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_team_week ON public.team_member_form_responses(team_id, week_start);
CREATE INDEX IF NOT EXISTS idx_responses_user_week ON public.team_member_form_responses(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_responses_snapshot_question ON public.team_member_form_responses(snapshot_question_id);

COMMENT ON TABLE public.team_member_form_responses IS 'Member answers to custom team review questions';
COMMENT ON COLUMN public.team_member_form_responses.snapshot_question_id IS 'References the snapshot question (not live form)';

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

-- Enable RLS
ALTER TABLE public.team_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_form_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_form_responses ENABLE ROW LEVEL SECURITY;

-- ----------------
-- team_forms Policies
-- ----------------

-- All team members can view the live form
CREATE POLICY "Team members can view team form"
  ON public.team_forms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_forms.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Only admins can insert/update/delete form questions
CREATE POLICY "Team admins can manage team form"
  ON public.team_forms FOR ALL
  USING (
    public.is_team_admin(team_id, auth.uid())
  );

-- ----------------
-- team_form_snapshots Policies
-- ----------------

-- All team members can view snapshots
CREATE POLICY "Team members can view form snapshots"
  ON public.team_form_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_form_snapshots.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Snapshots are immutable - only system (via Edge Function with service role) can insert
-- No UPDATE or DELETE policies - snapshots are permanent

-- ----------------
-- team_member_form_responses Policies
-- ----------------

-- Team members can view responses from their team
CREATE POLICY "Team members can view team responses"
  ON public.team_member_form_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_member_form_responses.team_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Members can insert/update their own responses
CREATE POLICY "Members can submit own responses"
  ON public.team_member_form_responses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_member_form_responses.team_id
        AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update own responses"
  ON public.team_member_form_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can delete responses (optional - for cleanup)
CREATE POLICY "Team admins can delete responses"
  ON public.team_member_form_responses FOR DELETE
  USING (
    public.is_team_admin(team_id, auth.uid())
  );

-- =====================================================================
-- HELPER FUNCTION: Get Monday of Week
-- =====================================================================
-- Utility function to normalize dates to the Monday of their week

CREATE OR REPLACE FUNCTION public.get_week_start(input_date DATE)
RETURNS DATE AS $$
BEGIN
  -- Get the Monday of the week containing input_date
  RETURN input_date - (EXTRACT(DOW FROM input_date)::INTEGER + 6) % 7;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.get_week_start IS 'Returns the Monday of the week containing the input date';

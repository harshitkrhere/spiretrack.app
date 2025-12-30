-- Phase 2: Advanced Team Features - Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Task Management Table
CREATE TABLE IF NOT EXISTS public.team_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai_suggestion', 'manual', 'action_plan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Plans Table
CREATE TABLE IF NOT EXISTS public.team_action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, week_start)
);

-- Metrics History Table for Trend Charts
CREATE TABLE IF NOT EXISTS public.team_metrics_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  morale_score INTEGER CHECK (morale_score >= 0 AND morale_score <= 100),
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  stress_score INTEGER CHECK (stress_score >= 0 AND stress_score <= 100),
  collaboration_score INTEGER CHECK (collaboration_score >= 0 AND collaboration_score <= 100),
  alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, week_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_tasks_team_id ON public.team_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned_to ON public.team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON public.team_tasks(team_id, status);
CREATE INDEX IF NOT EXISTS idx_team_action_plans_team_week ON public.team_action_plans(team_id, week_start);
CREATE INDEX IF NOT EXISTS idx_team_metrics_team_week ON public.team_metrics_history(team_id, week_start);

-- Enable RLS
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_metrics_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_tasks

-- Team members can view tasks for their team
CREATE POLICY "Team members can view team tasks"
  ON public.team_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team admins can insert tasks
CREATE POLICY "Team admins can create tasks"
  ON public.team_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Team admins can update tasks
CREATE POLICY "Team admins can update tasks"
  ON public.team_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Team admins can delete tasks
CREATE POLICY "Team admins can delete tasks"
  ON public.team_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_tasks.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- RLS Policies for team_action_plans

-- Team members can view action plans
CREATE POLICY "Team members can view action plans"
  ON public.team_action_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_action_plans.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team admins can create action plans
CREATE POLICY "Team admins can create action plans"
  ON public.team_action_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_action_plans.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Team admins can update action plans
CREATE POLICY "Team admins can update action plans"
  ON public.team_action_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_action_plans.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- RLS Policies for team_metrics_history

-- Team members can view metrics history
CREATE POLICY "Team members can view metrics history"
  ON public.team_metrics_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_metrics_history.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Only system (via service role) can insert metrics
-- This will be done by the team-operations Edge Function

-- Comments for documentation
COMMENT ON TABLE public.team_tasks IS 'Tasks created from AI suggestions or manually by team admins';
COMMENT ON TABLE public.team_action_plans IS 'Weekly action plans generated from executive reports';
COMMENT ON TABLE public.team_metrics_history IS 'Historical metrics for trend visualization';

COMMENT ON COLUMN public.team_tasks.source IS 'Origin of task: ai_suggestion, manual, or action_plan';
COMMENT ON COLUMN public.team_tasks.status IS 'Task status: todo, in_progress, or done';
COMMENT ON COLUMN public.team_tasks.priority IS 'Task priority: low, medium, or high';

-- Phase 3: Enterprise Analytics & Automation - Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments/Organization Structure
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add department to teams
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Team-wide KPIs
CREATE TABLE IF NOT EXISTS public.team_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT DEFAULT 'number', -- 'percentage', 'number', 'hours', 'count'
  period TEXT DEFAULT 'weekly' CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'off_track')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manager Assignments (users who can view multiple teams/departments)
CREATE TABLE IF NOT EXISTS public.manager_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  can_view_all_teams BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Automated Report Schedules
CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  time_of_day TIME DEFAULT '09:00:00',
  recipients JSONB DEFAULT '[]'::jsonb, -- array of email addresses
  enabled BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_teams_department ON public.teams(department_id);
CREATE INDEX IF NOT EXISTS idx_team_kpis_team ON public.team_kpis(team_id);
CREATE INDEX IF NOT EXISTS idx_team_kpis_period ON public.team_kpis(team_id, period);
CREATE INDEX IF NOT EXISTS idx_manager_assignments_user ON public.manager_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_manager_assignments_dept ON public.manager_assignments(department_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_team ON public.report_schedules(team_id, enabled);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON public.report_schedules(next_run) WHERE enabled = TRUE;

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments

-- Anyone can view departments
CREATE POLICY "Anyone can view departments"
  ON public.departments FOR SELECT
  USING (TRUE);

-- Only authenticated users can create departments (for now)
CREATE POLICY "Authenticated users can create departments"
  ON public.departments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for team_kpis

-- Team members can view their team's KPIs
CREATE POLICY "Team members can view team KPIs"
  ON public.team_kpis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_kpis.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team admins can manage KPIs
CREATE POLICY "Team admins can manage KPIs"
  ON public.team_kpis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_kpis.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- RLS Policies for manager_assignments

-- Users can view their own manager assignments
CREATE POLICY "Users can view own manager assignments"
  ON public.manager_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Only system/admins can create manager assignments (via service role)

-- RLS Policies for report_schedules

-- Team admins can manage report schedules
CREATE POLICY "Team admins can manage report schedules"
  ON public.report_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = report_schedules.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE public.departments IS 'Organizational departments for grouping teams';
COMMENT ON TABLE public.team_kpis IS 'Custom KPIs tracked per team';
COMMENT ON TABLE public.manager_assignments IS 'Managers who can view multiple teams/departments';
COMMENT ON TABLE public.report_schedules IS 'Automated report generation schedules';

COMMENT ON COLUMN public.team_kpis.status IS 'KPI status: on_track, at_risk, or off_track';
COMMENT ON COLUMN public.team_kpis.period IS 'Tracking period: daily, weekly, monthly, or quarterly';
COMMENT ON COLUMN public.report_schedules.frequency IS 'Report generation frequency';
COMMENT ON COLUMN public.report_schedules.recipients IS 'JSON array of email addresses to receive reports';

-- Phase 1: Add identity fields and expand team_weekly_reviews schema

-- Add identity fields to team_weekly_reviews
ALTER TABLE public.team_weekly_reviews 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role_position TEXT,
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment to clarify the expanded responses JSON structure
COMMENT ON COLUMN public.team_weekly_reviews.responses IS 
'Expanded JSON structure containing:
- Identity: full_name, role_position, employee_id, department, location
- Performance: tasks, completions, blockers, deadlines, meetings, deep_work_hours, collaboration_rating, stress_level, workload_level
- Quality: quality_rating, efficiency_rating, biggest_win, biggest_frustration, leadership_notes, workflow_improvements
- Metrics: kpis_achieved, kpi_notes, meaningful_work_time, wasted_time
- Next Week: goals, support_needs, expected_risks, do_differently';

-- Update team_consolidated_reports comment for expanded schema
COMMENT ON COLUMN public.team_consolidated_reports.report IS 
'Comprehensive executive report JSON containing:
- Scores: morale_score, productivity_score, risk_score, stress_score, alignment_score
- Analysis: collective_wins, collective_blockers, team_risks, themes
- Recommendations: delegation_suggestions, critical_path, recommended_manager_actions
- Planning: next_week_strategy, improvement_plan (urgent, medium, long_term)
- Insights: departmental_insights, operational_issues, long_term_risks
- Summary: summary_text (executive overview)';

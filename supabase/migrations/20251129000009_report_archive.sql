-- Add archive functionality to team_consolidated_reports

-- Add archived column
ALTER TABLE public.team_consolidated_reports 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add index for filtering archived reports
CREATE INDEX IF NOT EXISTS idx_team_consolidated_reports_archived 
ON public.team_consolidated_reports(team_id, archived, week_start);

-- Add RLS policy for admins to delete reports
CREATE POLICY "Team admins can delete reports"
  ON public.team_consolidated_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_consolidated_reports.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

-- Add RLS policy for admins to update reports (for archiving)
CREATE POLICY "Team admins can update reports"
  ON public.team_consolidated_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_consolidated_reports.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'admin'
    )
  );

COMMENT ON COLUMN public.team_consolidated_reports.archived IS 'Soft delete flag - archived reports are hidden from history but not deleted';

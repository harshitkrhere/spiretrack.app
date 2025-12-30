-- Fix: Add DELETE policy for teams table
-- This allows team admins (creators) to delete their teams

-- Add DELETE policy for teams
CREATE POLICY "Team creators can delete their teams" ON public.teams
  FOR DELETE USING (auth.uid() = created_by);

-- Verify the policy
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'teams';

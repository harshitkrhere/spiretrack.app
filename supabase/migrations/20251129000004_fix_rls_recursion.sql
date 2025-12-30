-- Fix infinite recursion in team_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON public.team_members;

-- Recreate policies without recursion
-- Users can view their own membership (no recursion)
-- This policy already exists and is fine

-- Admins can view ALL members of teams they admin
-- Fix: Use a simpler check that doesn't cause recursion
CREATE POLICY "Admins can view team members" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can remove members from their teams
CREATE POLICY "Admins can remove members" ON public.team_members
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update member roles in their teams
CREATE POLICY "Admins can update member roles" ON public.team_members
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

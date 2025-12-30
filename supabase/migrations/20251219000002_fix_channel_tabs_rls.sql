-- Fix RLS Policy for channel_tabs table
-- The original policy "Admins can manage channel tabs" uses FOR ALL USING
-- but doesn't include WITH CHECK, which is needed for INSERT operations.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage channel tabs" ON public.channel_tabs;

-- Recreate with proper USING and WITH CHECK for all operations
CREATE POLICY "Admins can manage channel tabs" ON public.channel_tabs
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tabs.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tabs.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Alternative: Allow ALL team members to create default tabs (simpler approach)
-- This is useful when the app needs to create tabs on channel load
CREATE POLICY IF NOT EXISTS "Team members can create channel tabs" ON public.channel_tabs
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tabs.team_id
      AND user_id = auth.uid()
    )
  );

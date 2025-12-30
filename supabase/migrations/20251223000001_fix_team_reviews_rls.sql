-- Fix RLS: Allow admins to view all team member submissions
-- Only adding the missing admin policy since user policy already exists

DROP POLICY IF EXISTS "Admins can view all team reviews" ON public.team_weekly_reviews;

-- Admins can view all team members' reviews
CREATE POLICY "Admins can view all team reviews" ON public.team_weekly_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = team_weekly_reviews.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

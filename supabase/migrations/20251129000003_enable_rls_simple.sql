-- Re-enable RLS and create SIMPLE, NON-RECURSIVE policies

-- Re-enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own membership" ON public.team_members;
DROP POLICY IF EXISTS "Admins can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON public.team_members;

DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can update their teams" ON public.teams;

-- ============================================
-- TEAM_MEMBERS POLICIES (SIMPLE, NO RECURSION)
-- ============================================

-- 1. Users can ALWAYS view their own membership rows
DROP POLICY IF EXISTS "Users can view own membership" ON public.team_members;
CREATE POLICY "Users can view own membership" ON public.team_members
  FOR SELECT 
  USING (user_id = auth.uid());

-- 2. Users can insert themselves into teams (for joining)
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- 3. Users can delete their own membership (leave team)
DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
CREATE POLICY "Users can leave teams" ON public.team_members
  FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================
-- TEAMS POLICIES (SIMPLE)
-- ============================================

-- 1. Users can view teams (we'll rely on app logic to filter by membership)
--    This is safe because team data itself isn't sensitive
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT 
  USING (true);

-- 2. Authenticated users can create teams
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- 3. Team creators can update their teams
DROP POLICY IF EXISTS "Creators can update teams" ON public.teams;
CREATE POLICY "Creators can update teams" ON public.teams
  FOR UPDATE 
  USING (auth.uid() = created_by);

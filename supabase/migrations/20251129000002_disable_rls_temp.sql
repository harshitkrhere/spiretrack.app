-- NUCLEAR OPTION: Temporarily disable RLS on team_members for testing
-- This will let us see if the data is actually there

ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

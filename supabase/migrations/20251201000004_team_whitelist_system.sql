-- Team Whitelist System Migration

-- 1. Add is_whitelist_enabled to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_whitelist_enabled BOOLEAN DEFAULT false;

-- 2. Create team_whitelist table
CREATE TABLE IF NOT EXISTS public.team_whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Can be NULL if user hasn't registered yet
    username TEXT, -- Stored lowercase for matching
    added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_team_user UNIQUE (team_id, user_id),
    CONSTRAINT unique_team_username UNIQUE (team_id, username)
);

-- 3. Enable RLS
ALTER TABLE public.team_whitelist ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Admins can view whitelist
-- Admins can view whitelist
DROP POLICY IF EXISTS "Admins can view whitelist" ON public.team_whitelist;
CREATE POLICY "Admins can view whitelist" ON public.team_whitelist
  FOR SELECT
  USING (is_team_admin(team_id, auth.uid()));

-- Admins can insert into whitelist
DROP POLICY IF EXISTS "Admins can add to whitelist" ON public.team_whitelist;
CREATE POLICY "Admins can add to whitelist" ON public.team_whitelist
  FOR INSERT
  WITH CHECK (is_team_admin(team_id, auth.uid()));

-- Admins can delete from whitelist
DROP POLICY IF EXISTS "Admins can remove from whitelist" ON public.team_whitelist;
CREATE POLICY "Admins can remove from whitelist" ON public.team_whitelist
  FOR DELETE
  USING (is_team_admin(team_id, auth.uid()));

-- Members can view whitelist (optional, but good for transparency if needed, currently restricted to admins in requirements but 'get_whitelist' action might be used by admins only)
-- Requirement said: "get_whitelist (all team members)" in Edge Function list, but "Admin Controls" section implies admin only.
-- Let's allow team members to view for now, or restrict to admins. 
-- The prompt said "View full list of whitelisted members" under "ADMIN CONTROLS".
-- So I will restrict to admins for now.
-- Wait, "get_whitelist (all team members)" was listed in Edge Function Actions. 
-- But "Admin Controls" section is specific.
-- I'll stick to Admin only for management. If members need to see it, I can add a policy later.
-- Actually, for `join_team` to work, the *user joining* (who is NOT a member yet) needs to be able to check?
-- No, `join_team` runs in Edge Function with Service Role (or admin client), so RLS doesn't block it there if we use service role.
-- But usually we use the user's client.
-- If `join_team` uses `supabase.rpc` or direct insert, it respects RLS.
-- The `join_team` action in Edge Function uses `adminClient` usually for privileged operations, or checks permissions.
-- In `team-operations`, `join_team` usually checks if the user is banned etc.
-- I'll ensure the Edge Function handles the check securely.

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_team_whitelist_team_id ON public.team_whitelist(team_id);
CREATE INDEX IF NOT EXISTS idx_team_whitelist_username ON public.team_whitelist(username);

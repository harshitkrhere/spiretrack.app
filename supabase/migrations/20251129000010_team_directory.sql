-- Phase 5: Discord-Style Team Member Directory
-- Creates custom roles system with role-based admin detection

-- 1. TEAM ROLES TABLE
CREATE TABLE IF NOT EXISTS public.team_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#808080',
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

CREATE INDEX IF NOT EXISTS idx_team_roles_position ON public.team_roles(team_id, position DESC);
CREATE INDEX IF NOT EXISTS idx_team_roles_admin ON public.team_roles(team_id, is_admin);

-- 2. TEAM MEMBER ROLES (Junction Table)
CREATE TABLE IF NOT EXISTS public.team_member_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.team_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_team_member_roles ON public.team_member_roles(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_roles_lookup ON public.team_member_roles(team_id, role_id);

-- 3. EXTEND TEAM_MEMBERS
ALTER TABLE public.team_members 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- 4. HELPER FUNCTION FOR ADMIN CHECK
CREATE OR REPLACE FUNCTION is_team_admin(check_team_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM team_member_roles tmr
    JOIN team_roles tr ON tr.id = tmr.role_id
    WHERE tmr.team_id = check_team_id
      AND tmr.user_id = check_user_id
      AND tr.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES

-- Team Roles: View
CREATE POLICY "Team members can view roles" ON public.team_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_roles.team_id 
      AND user_id = auth.uid()
    )
  );

-- Team Roles: Insert (Admin only)
CREATE POLICY "Admins can create roles" ON public.team_roles
  FOR INSERT WITH CHECK (
    is_team_admin(team_id, auth.uid())
  );

-- Team Roles: Update (Admin only)
CREATE POLICY "Admins can update roles" ON public.team_roles
  FOR UPDATE USING (
    is_team_admin(team_id, auth.uid())
  );

-- Team Roles: Delete (Admin only)
CREATE POLICY "Admins can delete roles" ON public.team_roles
  FOR DELETE USING (
    is_team_admin(team_id, auth.uid())
  );

-- Member Roles: View
CREATE POLICY "Team members can view member roles" ON public.team_member_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_member_roles.team_id 
      AND user_id = auth.uid()
    )
  );

-- Member Roles: Insert (Admin only)
CREATE POLICY "Admins can assign roles" ON public.team_member_roles
  FOR INSERT WITH CHECK (
    is_team_admin(team_id, auth.uid())
  );

-- Member Roles: Delete (Admin only)
CREATE POLICY "Admins can unassign roles" ON public.team_member_roles
  FOR DELETE USING (
    is_team_admin(team_id, auth.uid())
  );

-- Enable RLS
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_roles ENABLE ROW LEVEL SECURITY;

-- 6. CREATE DEFAULT ADMIN ROLE FOR EXISTING TEAMS
INSERT INTO public.team_roles (team_id, name, color, icon, position, is_admin, created_by)
SELECT 
  t.id,
  'Admin',
  '#FF5733',
  '👨‍💼',
  1000,
  true,
  t.created_by
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_roles tr 
  WHERE tr.team_id = t.id AND tr.is_admin = true
);

-- 7. ASSIGN ADMIN ROLE TO TEAM CREATORS
INSERT INTO public.team_member_roles (team_id, user_id, role_id)
SELECT 
  t.id,
  t.created_by,
  tr.id
FROM public.teams t
JOIN public.team_roles tr ON tr.team_id = t.id AND tr.is_admin = true
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_member_roles tmr
  WHERE tmr.team_id = t.id 
  AND tmr.user_id = t.created_by
  AND tmr.role_id = tr.id
);

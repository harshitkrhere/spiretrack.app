-- Create kick records
CREATE TABLE IF NOT EXISTS team_kick_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kicked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ban records (audit log)
CREATE TABLE IF NOT EXISTS team_ban_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_kick_records_user_team ON team_kick_records(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_team_ban_records_user_team ON team_ban_records(user_id, team_id);

-- RLS
ALTER TABLE team_kick_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_ban_records ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage these records
CREATE POLICY "Admins can view kick records" ON team_kick_records
  FOR SELECT USING (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can insert kick records" ON team_kick_records
  FOR INSERT WITH CHECK (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can delete kick records" ON team_kick_records
  FOR DELETE USING (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can view ban records" ON team_ban_records
  FOR SELECT USING (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can insert ban records" ON team_ban_records
  FOR INSERT WITH CHECK (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Admins can delete ban records" ON team_ban_records
  FOR DELETE USING (is_team_admin(team_id, auth.uid()));

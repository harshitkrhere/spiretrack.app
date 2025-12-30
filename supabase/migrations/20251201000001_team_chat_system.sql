-- Phase 13: Team Chat System

-- 1. TEAM CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.team_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Indexes for channels
CREATE INDEX IF NOT EXISTS idx_team_channels_team_position ON public.team_channels(team_id, position);

-- 2. TEAM MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.team_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of { url, type, name, size }
  mentions JSONB DEFAULT '[]'::jsonb, -- Array of user_ids
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_team_messages_channel_created ON public.team_messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_team_messages_team_created ON public.team_messages(team_id, created_at);

-- 3. RLS POLICIES

-- Enable RLS
ALTER TABLE public.team_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- CHANNELS POLICIES

-- View: All team members can view channels
CREATE POLICY "Team members can view channels" ON public.team_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_channels.team_id 
      AND user_id = auth.uid()
    )
  );

-- Manage: Only admins can insert/update/delete channels
CREATE POLICY "Admins can insert channels" ON public.team_channels
  FOR INSERT WITH CHECK (
    is_team_admin(team_id, auth.uid())
  );

CREATE POLICY "Admins can update channels" ON public.team_channels
  FOR UPDATE USING (
    is_team_admin(team_id, auth.uid())
  );

CREATE POLICY "Admins can delete channels" ON public.team_channels
  FOR DELETE USING (
    is_team_admin(team_id, auth.uid())
  );

-- MESSAGES POLICIES

-- View: All team members can view messages
CREATE POLICY "Team members can view messages" ON public.team_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_messages.team_id 
      AND user_id = auth.uid()
    )
  );

-- Insert: Team members can send messages to their team's channels
CREATE POLICY "Team members can send messages" ON public.team_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_messages.team_id 
      AND user_id = auth.uid()
    )
    AND
    -- Ensure channel belongs to the team
    EXISTS (
      SELECT 1 FROM public.team_channels
      WHERE id = team_messages.channel_id
      AND team_id = team_messages.team_id
    )
  );

-- Update/Delete: Only admins can manage messages (for now)
-- Note: Users might want to delete their own messages later, but requirement says "Messages cannot be edited or deleted by non-admins"
CREATE POLICY "Admins can update messages" ON public.team_messages
  FOR UPDATE USING (
    is_team_admin(team_id, auth.uid())
  );

CREATE POLICY "Admins can delete messages" ON public.team_messages
  FOR DELETE USING (
    is_team_admin(team_id, auth.uid())
  );

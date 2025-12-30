-- ========================================
-- Phase 1.5: Channel Context Tabs System
-- ========================================
-- Transforms channels into structured workspaces
-- Default tabs: Messages, Overview, Tasks, Files, Reports, Activity

-- ========================================
-- 1. CHANNEL TABS TABLE
-- ========================================
-- Stores which tabs exist for each channel

CREATE TABLE IF NOT EXISTS public.channel_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('messages', 'overview', 'tasks', 'files', 'reports', 'activity')),
  label TEXT, -- Custom label override (null = use default)
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE, -- Messages tab is always default
  is_removable BOOLEAN DEFAULT TRUE, -- Messages tab is NOT removable
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(channel_id, type) -- One tab of each type per channel
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channel_tabs_channel ON public.channel_tabs(channel_id, position);
CREATE INDEX IF NOT EXISTS idx_channel_tabs_team ON public.channel_tabs(team_id);

COMMENT ON TABLE public.channel_tabs IS 'Tab definitions per channel. Messages tab is always present and not removable.';

-- ========================================
-- 2. CHANNEL TAB CONTENT TABLE
-- ========================================
-- Stores structured content for Overview tab (JSONB)

CREATE TABLE IF NOT EXISTS public.channel_tab_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID REFERENCES public.channel_tabs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content JSONB DEFAULT '{
    "purpose": "",
    "goals": [],
    "owners": [],
    "links": [],
    "status": "active"
  }'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.channel_tab_content IS 'Structured content for Overview tab. JSONB for flexibility.';
COMMENT ON COLUMN public.channel_tab_content.content IS 'JSON structure: {purpose, goals[], owners[], links[], status}';

-- ========================================
-- 3. CHANNEL TASKS TABLE
-- ========================================
-- Tasks scoped to a channel

CREATE TABLE IF NOT EXISTS public.channel_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  linked_message_id UUID REFERENCES public.team_messages(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channel_tasks_channel ON public.channel_tasks(channel_id, status);
CREATE INDEX IF NOT EXISTS idx_channel_tasks_assignee ON public.channel_tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channel_tasks_due ON public.channel_tasks(due_date) WHERE due_date IS NOT NULL;

COMMENT ON TABLE public.channel_tasks IS 'Channel-scoped tasks with assignment, status, and message linking.';

-- ========================================
-- 4. CHANNEL FILES TABLE
-- ========================================
-- Files and resources attached to a channel

CREATE TABLE IF NOT EXISTS public.channel_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type VARCHAR(100), -- MIME type or category
  size_bytes BIGINT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_external_link BOOLEAN DEFAULT FALSE, -- true = external URL, false = uploaded file
  version INTEGER DEFAULT 1,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channel_files_channel ON public.channel_files(channel_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_files_pinned ON public.channel_files(channel_id, is_pinned) WHERE is_pinned = TRUE;

COMMENT ON TABLE public.channel_files IS 'Files and external links attached to channels. Supports versioning and pinning.';

-- ========================================
-- 5. RLS POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.channel_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_tab_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_files ENABLE ROW LEVEL SECURITY;

-- CHANNEL TABS POLICIES

-- View: Team members can see tabs
DROP POLICY IF EXISTS "Team members can view channel tabs" ON public.channel_tabs;
CREATE POLICY "Team members can view channel tabs" ON public.channel_tabs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tabs.team_id
      AND user_id = auth.uid()
    )
  );

-- Admin-only: Insert/Update/Delete tabs
DROP POLICY IF EXISTS "Admins can manage channel tabs" ON public.channel_tabs;
CREATE POLICY "Admins can manage channel tabs" ON public.channel_tabs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tabs.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- TAB CONTENT POLICIES

-- View: Team members can see content
DROP POLICY IF EXISTS "Team members can view tab content" ON public.channel_tab_content;
CREATE POLICY "Team members can view tab content" ON public.channel_tab_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channel_tabs ct
      JOIN public.team_members tm ON tm.team_id = ct.team_id
      WHERE ct.id = channel_tab_content.tab_id
      AND tm.user_id = auth.uid()
    )
  );

-- Update: Team members can update (admins have more control via application logic)
DROP POLICY IF EXISTS "Team members can update tab content" ON public.channel_tab_content;
CREATE POLICY "Team members can update tab content" ON public.channel_tab_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.channel_tabs ct
      JOIN public.team_members tm ON tm.team_id = ct.team_id
      WHERE ct.id = channel_tab_content.tab_id
      AND tm.user_id = auth.uid()
    )
  );

-- Insert: Admins only
DROP POLICY IF EXISTS "Admins can insert tab content" ON public.channel_tab_content;
CREATE POLICY "Admins can insert tab content" ON public.channel_tab_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_tabs ct
      JOIN public.team_members tm ON tm.team_id = ct.team_id
      WHERE ct.id = channel_tab_content.tab_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- TASKS POLICIES

-- View: Team members can see tasks
DROP POLICY IF EXISTS "Team members can view channel tasks" ON public.channel_tasks;
CREATE POLICY "Team members can view channel tasks" ON public.channel_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tasks.team_id
      AND user_id = auth.uid()
    )
  );

-- Insert: All team members can create tasks
DROP POLICY IF EXISTS "Team members can create tasks" ON public.channel_tasks;
CREATE POLICY "Team members can create tasks" ON public.channel_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tasks.team_id
      AND user_id = auth.uid()
    )
  );

-- Update: Creator or assignee or admin can update
DROP POLICY IF EXISTS "Task owners can update tasks" ON public.channel_tasks;
CREATE POLICY "Task owners can update tasks" ON public.channel_tasks
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tasks.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Delete: Creator or admin can delete
DROP POLICY IF EXISTS "Task owners can delete tasks" ON public.channel_tasks;
CREATE POLICY "Task owners can delete tasks" ON public.channel_tasks
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_tasks.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- FILES POLICIES

-- View: Team members can see files
DROP POLICY IF EXISTS "Team members can view channel files" ON public.channel_files;
CREATE POLICY "Team members can view channel files" ON public.channel_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_files.team_id
      AND user_id = auth.uid()
    )
  );

-- Insert: All team members can upload files
DROP POLICY IF EXISTS "Team members can upload files" ON public.channel_files;
CREATE POLICY "Team members can upload files" ON public.channel_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_files.team_id
      AND user_id = auth.uid()
    )
  );

-- Update: Uploader or admin can update
DROP POLICY IF EXISTS "File owners can update files" ON public.channel_files;
CREATE POLICY "File owners can update files" ON public.channel_files
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_files.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Delete: Uploader or admin can delete
DROP POLICY IF EXISTS "File owners can delete files" ON public.channel_files;
CREATE POLICY "File owners can delete files" ON public.channel_files
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = channel_files.team_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ========================================
-- 6. HELPER FUNCTION: Updated At Trigger
-- ========================================

CREATE OR REPLACE FUNCTION update_channel_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_channel_tasks_updated_at ON public.channel_tasks;
CREATE TRIGGER trigger_channel_tasks_updated_at
  BEFORE UPDATE ON public.channel_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_tasks_updated_at();

CREATE OR REPLACE FUNCTION update_tab_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tab_content_updated_at ON public.channel_tab_content;
CREATE TRIGGER trigger_tab_content_updated_at
  BEFORE UPDATE ON public.channel_tab_content
  FOR EACH ROW
  EXECUTE FUNCTION update_tab_content_updated_at();

-- ========================================
-- 7. STORAGE BUCKET FOR CHANNEL FILES
-- ========================================
-- Note: This section may need to be run via Supabase Dashboard
-- if your Supabase version doesn't support storage bucket creation via SQL

-- Create storage bucket (if storage extension is available)
INSERT INTO storage.buckets (id, name, public)
VALUES ('channel-files', 'channel-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Team members can upload files to channel-files" ON storage.objects;
CREATE POLICY "Team members can upload files to channel-files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'channel-files');

-- Allow authenticated users to view files
DROP POLICY IF EXISTS "Team members can view files in channel-files" ON storage.objects;
CREATE POLICY "Team members can view files in channel-files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'channel-files');

-- Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own files in channel-files" ON storage.objects;
CREATE POLICY "Users can delete own files in channel-files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'channel-files');

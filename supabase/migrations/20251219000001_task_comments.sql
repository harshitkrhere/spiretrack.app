-- Task Comments Enhancement Migration
-- This migration adds a task_comments table and fixes task-related features

-- ============================================================================
-- 1. TASK COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES channel_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  -- Attachments stored as JSONB array: [{type, url, name, size}]
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. RLS POLICIES FOR TASK COMMENTS
-- ============================================================================

-- Policy: Team members can view comments on tasks in their channels
DROP POLICY IF EXISTS "Team members can view task comments" ON task_comments;
CREATE POLICY "Team members can view task comments"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_tasks ct
      JOIN team_channels tc ON ct.channel_id = tc.id  
      JOIN team_members tm ON tc.team_id = tm.team_id
      WHERE ct.id = task_comments.task_id 
        AND tm.user_id = auth.uid()
    )
  );

-- Policy: Any team member can create comments on tasks
DROP POLICY IF EXISTS "Team members can create comments" ON task_comments;
CREATE POLICY "Team members can create comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM channel_tasks ct
      JOIN team_channels tc ON ct.channel_id = tc.id  
      JOIN team_members tm ON tc.team_id = tm.team_id
      WHERE ct.id = task_comments.task_id 
        AND tm.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON task_comments;
CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
DROP POLICY IF EXISTS "Users can delete own comments" ON task_comments;
CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. REALTIME SUBSCRIPTION
-- ============================================================================

-- Enable realtime for task_comments
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;

-- ============================================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_task_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_task_comment_updated_at();

-- Phase 1: Enhanced Team Chat System
-- Features: Threading, Reactions, Pinning, System Messages, Search
-- Approved: 2025-12-06

-- ========================================
-- 1. ALTER team_messages FOR THREADING & SYSTEM MESSAGES
-- ========================================

ALTER TABLE public.team_messages 
  ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.team_messages(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS thread_reply_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS last_thread_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS system_event_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS system_event_data JSONB,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_message 
  ON public.team_messages(parent_message_id) 
  WHERE parent_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_thread_sorting 
  ON public.team_messages(channel_id, last_thread_reply_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_system_messages 
  ON public.team_messages(channel_id, is_system_message, created_at DESC) 
  WHERE is_system_message = TRUE;

CREATE INDEX IF NOT EXISTS idx_main_messages
  ON public.team_messages(channel_id, created_at DESC)
  WHERE parent_message_id IS NULL;

-- ========================================
-- 2. CREATE message_reactions TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.team_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type VARCHAR(20) NOT NULL 
    CHECK (reaction_type IN ('acknowledge', 'seen', 'completed', 'important')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, user_id, reaction_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reactions_message 
  ON public.message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user 
  ON public.message_reactions(user_id);

COMMENT ON TABLE public.message_reactions IS 'Semantic reactions for messages: acknowledge, seen, completed, important';
COMMENT ON COLUMN public.message_reactions.reaction_type IS 'Limited to 4 semantic types for enterprise use';

-- ========================================
-- 3. CREATE pinned_messages TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.team_messages(id) ON DELETE CASCADE NOT NULL UNIQUE,
  channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pinned_channel 
  ON public.pinned_messages(channel_id, pinned_at DESC);

CREATE INDEX IF NOT EXISTS idx_pinned_team
  ON public.pinned_messages(team_id);

COMMENT ON TABLE public.pinned_messages IS 'Pinned messages - maximum 10 per channel enforced in application logic';

-- ========================================
-- 4. FULL-TEXT SEARCH
-- ========================================

-- Add search vector column
ALTER TABLE public.team_messages 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_message_search 
  ON public.team_messages USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Only index content for non-system messages or include system messages too
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain search vector
DROP TRIGGER IF EXISTS message_search_vector_update ON public.team_messages;
CREATE TRIGGER message_search_vector_update
  BEFORE INSERT OR UPDATE OF content 
  ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_search_vector();

-- Backfill existing messages
UPDATE public.team_messages 
SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- ========================================
-- 5. FUNCTION: Update Thread Counts (Atomic)
-- ========================================

CREATE OR REPLACE FUNCTION update_thread_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- When a reply is added to a thread
  IF NEW.parent_message_id IS NOT NULL THEN
    UPDATE public.team_messages
    SET 
      thread_reply_count = thread_reply_count + 1,
      last_thread_reply_at = NEW.created_at
    WHERE id = NEW.parent_message_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_thread_counts ON public.team_messages;
CREATE TRIGGER maintain_thread_counts
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_counts();

-- Function for when thread replies are deleted
CREATE OR REPLACE FUNCTION update_thread_counts_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  latest_reply TIMESTAMPTZ;
BEGIN
  -- When a reply is deleted from a thread
  IF OLD.parent_message_id IS NOT NULL THEN
    -- Get the latest remaining reply timestamp
    SELECT MAX(created_at) INTO latest_reply
    FROM public.team_messages
    WHERE parent_message_id = OLD.parent_message_id;
    
    UPDATE public.team_messages
    SET 
      thread_reply_count = GREATEST(0, thread_reply_count - 1),
      last_thread_reply_at = latest_reply
    WHERE id = OLD.parent_message_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_thread_counts_on_delete ON public.team_messages;
CREATE TRIGGER maintain_thread_counts_on_delete
  AFTER DELETE ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_counts_on_delete();

-- ========================================
-- 6. RLS POLICIES
-- ========================================

-- REACTIONS POLICIES
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- View: Team members can see reactions
DROP POLICY IF EXISTS "Team members can view reactions" ON public.message_reactions;
CREATE POLICY "Team members can view reactions" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_messages tm
      JOIN public.team_members tmem ON tmem.team_id = tm.team_id
      WHERE tm.id = message_reactions.message_id
      AND tmem.user_id = auth.uid()
    )
  );

-- Insert: Team members can add reactions (except to system messages)
DROP POLICY IF EXISTS "Team members can add reactions" ON public.message_reactions;
CREATE POLICY "Team members can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_messages tm
      JOIN public.team_members tmem ON tmem.team_id = tm.team_id
      WHERE tm.id = message_reactions.message_id
      AND tmem.user_id = auth.uid()
      AND tm.is_system_message = FALSE  -- Cannot react to system messages
    )
  );

-- Delete: Users can remove their own reactions
DROP POLICY IF EXISTS "Users can remove own reactions" ON public.message_reactions;
CREATE POLICY "Users can remove own reactions" ON public.message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- PINNED MESSAGES POLICIES
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- View: Team members can see pinned messages
DROP POLICY IF EXISTS "Team members can view pinned messages" ON public.pinned_messages;
CREATE POLICY "Team members can view pinned messages" ON public.pinned_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = pinned_messages.team_id
      AND user_id = auth.uid()
    )
  );

-- Insert: Only admins can pin messages
DROP POLICY IF EXISTS "Admins can pin messages" ON public.pinned_messages;
CREATE POLICY "Admins can pin messages" ON public.pinned_messages
  FOR INSERT WITH CHECK (
    is_team_admin(team_id, auth.uid())
  );

-- Delete: Only admins can unpin messages
DROP POLICY IF EXISTS "Admins can unpin messages" ON public.pinned_messages;
CREATE POLICY "Admins can unpin messages" ON public.pinned_messages
  FOR DELETE USING (
    is_team_admin(team_id, auth.uid())
  );

-- UPDATE team_messages POLICIES for editing

-- Users can edit their own messages within 15 minutes (not system messages)
DROP POLICY IF EXISTS "Users can edit own messages in 15min" ON public.team_messages;
CREATE POLICY "Users can edit own messages in 15min" ON public.team_messages
  FOR UPDATE USING (
    user_id = auth.uid() 
    AND is_system_message = FALSE
    AND created_at > NOW() - INTERVAL '15 minutes'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND is_system_message = FALSE
  );

-- ========================================
-- 7. HELPER FUNCTIONS
-- ========================================

-- Function to check pin limit (max 10 per channel)
CREATE OR REPLACE FUNCTION check_pin_limit()
RETURNS TRIGGER AS $$
DECLARE
  pin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pin_count
  FROM public.pinned_messages
  WHERE channel_id = NEW.channel_id;
  
  IF pin_count >= 10 THEN
    RAISE EXCEPTION 'Maximum 10 pinned messages per channel reached';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_pin_limit ON public.pinned_messages;
CREATE TRIGGER enforce_pin_limit
  BEFORE INSERT ON public.pinned_messages
  FOR EACH ROW
  EXECUTE FUNCTION check_pin_limit();

-- Function to validate system messages
CREATE OR REPLACE FUNCTION validate_system_message()
RETURNS TRIGGER AS $$
BEGIN
  -- System messages must have user_id = NULL
  IF NEW.is_system_message = TRUE AND NEW.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'System messages must have user_id = NULL';
  END IF;
  
  -- System messages cannot be replies
  IF NEW.is_system_message = TRUE AND NEW.parent_message_id IS NOT NULL THEN
    RAISE EXCEPTION 'System messages cannot be thread replies';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_system_msg ON public.team_messages;
CREATE TRIGGER validate_system_msg
  BEFORE INSERT OR UPDATE ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_system_message();

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN public.team_messages.parent_message_id IS 'NULL = main message, non-NULL = thread reply';
COMMENT ON COLUMN public.team_messages.thread_reply_count IS 'Maintained atomically by triggers';
COMMENT ON COLUMN public.team_messages.is_system_message IS 'System messages: user_id=NULL, not editable/deletable/reactable/replyable';
COMMENT ON COLUMN public.team_messages.edited_at IS 'Set when user edits message (within 15min window)';
COMMENT ON COLUMN public.team_messages.search_vector IS 'Full-text search vector, auto-maintained by trigger';

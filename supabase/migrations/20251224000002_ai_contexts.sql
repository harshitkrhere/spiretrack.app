-- Phase 4: Contextual AI - Database Foundation
-- Creates tables for AI-generated insights and contextual follow-up chat

-- ============================================================================
-- AI Contexts Table
-- Stores every AI-generated insight (weekly reports, team insights, decisions, risks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_contexts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    context_type text NOT NULL CHECK (
        context_type IN (
            'weekly_report',
            'team_insight',
            'decision_analysis',
            'risk_flag'
        )
    ),
    source_entity_id uuid NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    ai_output jsonb NOT NULL,
    generated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- AI Context Messages Table
-- Stores follow-up Q&A tied to a specific AI context
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_context_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id uuid REFERENCES public.ai_contexts(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_contexts_user ON public.ai_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_contexts_team ON public.ai_contexts(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_contexts_source ON public.ai_contexts(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_contexts_type ON public.ai_contexts(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_context ON public.ai_context_messages(context_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON public.ai_context_messages(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.ai_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_context_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own contexts
CREATE POLICY "Users can view own contexts" ON public.ai_contexts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view team-level contexts
CREATE POLICY "Admins can view team contexts" ON public.ai_contexts
    FOR SELECT
    USING (
        context_type IN ('team_insight', 'risk_flag')
        AND EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = ai_contexts.team_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Service role can insert contexts (for Edge Functions)
CREATE POLICY "Service role can insert contexts" ON public.ai_contexts
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view messages for their own contexts
CREATE POLICY "Users can view own context messages" ON public.ai_context_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_contexts
            WHERE id = context_id
            AND user_id = auth.uid()
        )
    );

-- Admins can view messages for team contexts
CREATE POLICY "Admins can view team context messages" ON public.ai_context_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_contexts
            WHERE id = context_id
            AND context_type IN ('team_insight', 'risk_flag')
            AND EXISTS (
                SELECT 1 FROM public.team_members
                WHERE team_id = ai_contexts.team_id
                AND user_id = auth.uid()
                AND role = 'admin'
            )
        )
    );

-- Users can insert messages for their own contexts
CREATE POLICY "Users can insert own context messages" ON public.ai_context_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_contexts
            WHERE id = context_id
            AND user_id = auth.uid()
        )
    );

-- Service role can insert messages (for AI responses)
CREATE POLICY "Service role can insert messages" ON public.ai_context_messages
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.ai_contexts IS 'Stores AI-generated insights with locked context for follow-up chat';
COMMENT ON TABLE public.ai_context_messages IS 'Stores contextual Q&A tied to specific AI insights';
COMMENT ON COLUMN public.ai_contexts.context_type IS 'Type of AI analysis: weekly_report, team_insight, decision_analysis, or risk_flag';
COMMENT ON COLUMN public.ai_contexts.source_entity_id IS 'ID of the source entity (weekly_review_id, team_id, decision_id, etc.)';
COMMENT ON COLUMN public.ai_contexts.ai_output IS 'Immutable AI-generated analysis (JSON)';

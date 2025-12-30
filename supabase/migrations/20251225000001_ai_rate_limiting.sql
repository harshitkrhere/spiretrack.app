-- Per-User AI Rate Limiting
-- Tracks AI usage to prevent abuse

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    function_name TEXT NOT NULL, -- 'contextual-chat', 'submit-review', etc.
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient querying by user and time
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_time 
ON public.ai_usage_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_function 
ON public.ai_usage_log(function_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (Edge Functions)
CREATE POLICY "Service role can insert ai_usage_log" ON public.ai_usage_log
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own usage
CREATE POLICY "Users can view own ai_usage_log" ON public.ai_usage_log
    FOR SELECT
    USING (auth.uid() = user_id);

-- Helper function to check rate limit (token-based)
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
    p_user_id UUID,
    p_function_name TEXT,
    p_max_tokens INTEGER DEFAULT 1000,
    p_window_hours INTEGER DEFAULT 2
)
RETURNS BOOLEAN AS $$
DECLARE
    tokens_consumed INTEGER;
BEGIN
    SELECT COALESCE(SUM(tokens_used), 0) INTO tokens_consumed
    FROM public.ai_usage_log
    WHERE user_id = p_user_id
    AND function_name = p_function_name
    AND created_at > NOW() - (p_window_hours || ' hours')::INTERVAL;
    
    RETURN tokens_consumed < p_max_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE public.ai_usage_log IS 'Tracks AI API usage per user for rate limiting';
COMMENT ON FUNCTION public.check_ai_rate_limit IS 'Returns TRUE if user is under rate limit, FALSE if exceeded';

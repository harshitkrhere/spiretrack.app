-- Create team_form_questions table
CREATE TABLE IF NOT EXISTS public.team_form_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'long_text', 'number', 'rating')),
    position INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_team_form_questions_team_id ON public.team_form_questions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_form_questions_position ON public.team_form_questions(position);

-- Enable RLS
ALTER TABLE public.team_form_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- View: Team members can view questions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'team_form_questions' AND policyname = 'Team members can view form questions') THEN
        CREATE POLICY "Team members can view form questions"
            ON public.team_form_questions
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.team_members
                    WHERE team_members.team_id = team_form_questions.team_id
                    AND team_members.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Manage: Only admins can manage questions (via Edge Function mostly, but good to have RLS)
-- Actually, since we use Service Role in Edge Function for saving, we don't strictly need an INSERT policy for authenticated users if we only allow it via Edge Function.
-- But let's add one for consistency if we ever switch to client-side.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'team_form_questions' AND policyname = 'Team admins can manage form questions') THEN
        CREATE POLICY "Team admins can manage form questions"
            ON public.team_form_questions
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.team_members
                    WHERE team_members.team_id = team_form_questions.team_id
                    AND team_members.user_id = auth.uid()
                    AND team_members.role = 'admin'
                )
            );
    END IF;
END $$;

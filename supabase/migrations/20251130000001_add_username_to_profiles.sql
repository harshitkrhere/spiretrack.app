-- Add username column to users if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS needs_username_update BOOLEAN DEFAULT FALSE;

-- Create a unique index on lowercase username to ensure case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
ON public.users (LOWER(username));

-- Backfill existing users with a temporary username
-- Format: user_ + first 8 chars of UUID
UPDATE public.users
SET 
  username = 'user_' || SUBSTRING(id::text, 1, 8),
  needs_username_update = TRUE
WHERE username IS NULL;

-- Now that backfill is done, we can add the NOT NULL constraint
ALTER TABLE public.users 
ALTER COLUMN username SET NOT NULL;

-- Add a constraint to ensure username format (basic check, more strict regex in app)
-- This ensures no spaces and minimum length
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'username_format_check') THEN
    ALTER TABLE public.users
    ADD CONSTRAINT username_format_check 
    CHECK (
      LENGTH(username) >= 3 AND 
      LENGTH(username) <= 30 AND
      username !~ '\s' -- No whitespace allowed
    );
  END IF;
END $$;

-- RLS Policy: Allow users to update their own username
-- This assumes RLS is already enabled on users
DROP POLICY IF EXISTS "Users can update their own username" ON public.users;
CREATE POLICY "Users can update their own username"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

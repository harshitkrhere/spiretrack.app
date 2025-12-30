-- Fix for signup failure: "Database error saving new user"
-- This happens because the auth trigger tries to insert into public.users without a username,
-- but we added a NOT NULL constraint.

-- 1. Make username nullable temporarily to prevent hard crashes
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;

-- 2. Create a function to generate a default username if none is provided
CREATE OR REPLACE FUNCTION public.generate_default_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if username is null
  IF NEW.username IS NULL THEN
    -- Generate a random username: user_ + 8 random hex chars
    NEW.username := 'user_' || substr(md5(random()::text), 1, 8);
    NEW.needs_username_update := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to automatically assign this username BEFORE INSERT on public.users
DROP TRIGGER IF EXISTS ensure_username_on_insert ON public.users;

CREATE TRIGGER ensure_username_on_insert
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.generate_default_username();

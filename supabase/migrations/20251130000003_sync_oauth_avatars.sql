-- Sync OAuth Avatar URLs from auth.users to public.users
-- This ensures profile pictures from Google, etc. are automatically inherited

-- 1. Add avatar_url column to public.users if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create function to sync avatar from auth.users metadata
CREATE OR REPLACE FUNCTION public.sync_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has avatar in metadata (from OAuth providers like Google)
  IF NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL THEN
    -- Update public.users with the avatar URL
    UPDATE public.users
    SET avatar_url = NEW.raw_user_meta_data->>'avatar_url'
    WHERE id = NEW.id;
  ELSIF NEW.raw_user_meta_data->>'picture' IS NOT NULL THEN
    -- Some providers use 'picture' instead of 'avatar_url'
    UPDATE public.users
    SET avatar_url = NEW.raw_user_meta_data->>'picture'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger on auth.users to sync avatar on insert/update
DROP TRIGGER IF EXISTS on_auth_user_avatar_sync ON auth.users;

CREATE TRIGGER on_auth_user_avatar_sync
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_avatar();

-- 4. Backfill existing users with avatars from auth metadata
UPDATE public.users u
SET avatar_url = COALESCE(
  au.raw_user_meta_data->>'avatar_url',
  au.raw_user_meta_data->>'picture'
)
FROM auth.users au
WHERE u.id = au.id
  AND u.avatar_url IS NULL
  AND (
    au.raw_user_meta_data->>'avatar_url' IS NOT NULL
    OR au.raw_user_meta_data->>'picture' IS NOT NULL
  );

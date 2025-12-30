-- Allow authenticated users to view other users' profiles (needed for chat)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
  END IF;
END $$;

CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');

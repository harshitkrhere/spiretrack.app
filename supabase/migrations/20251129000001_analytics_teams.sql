-- Enable pg_cron if available (for cache cleanup)
create extension if not exists "pg_cron";

-- 1. TEAMS TABLE
create table if not exists public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);
alter table public.teams enable row level security;

-- 2. TEAM MEMBERS TABLE
create table if not exists public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);
alter table public.team_members enable row level security;

-- 3. TEAM WEEKLY REVIEWS TABLE
create table if not exists public.team_weekly_reviews (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start date not null,
  responses jsonb default '{}'::jsonb,
  ai_output jsonb,
  ai_version text,
  created_at timestamptz default now()
);
alter table public.team_weekly_reviews enable row level security;
create index if not exists idx_team_weekly_reviews_team_submitted on public.team_weekly_reviews(team_id, created_at);

-- 4. TEAM CONSOLIDATED REPORTS TABLE
create table if not exists public.team_consolidated_reports (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  week_start date not null,
  report jsonb,
  ai_version text,
  created_at timestamptz default now(),
  unique(team_id, week_start)
);
alter table public.team_consolidated_reports enable row level security;

-- 5. ANALYTICS CACHE TABLE
create table if not exists public.analytics_cache (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb,
  created_at timestamptz default now()
);
alter table public.analytics_cache enable row level security;
create index if not exists idx_analytics_cache_user on public.analytics_cache(user_id);

-- 6. UPDATES TO EXISTING TABLES
alter table public.weekly_reviews add column if not exists ai_version text;
create index if not exists idx_weekly_reviews_user_submitted on public.weekly_reviews(user_id, created_at);

-- RLS POLICIES

-- TEAMS
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
    DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
    DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
    DROP POLICY IF EXISTS "Admins can update their teams" ON public.teams;
  END IF;
END $$;

create policy "Users can view teams they belong to" on public.teams
  for select using (
    exists (select 1 from public.team_members where team_id = public.teams.id and user_id = auth.uid())
  );

create policy "Users can create teams" on public.teams
  for insert with check (auth.uid() = created_by);

create policy "Admins can update their teams" on public.teams
  for update using (auth.uid() = created_by);

-- TEAM MEMBERS
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    DROP POLICY IF EXISTS "Users can view their own membership" ON public.team_members;
    DROP POLICY IF EXISTS "Admins can view team members" ON public.team_members;
    DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
    DROP POLICY IF EXISTS "Users can leave teams" ON public.team_members;
    DROP POLICY IF EXISTS "Admins can remove members" ON public.team_members;
    DROP POLICY IF EXISTS "Admins can update member roles" ON public.team_members;
  END IF;
END $$;

create policy "Users can view their own membership" on public.team_members
  for select using (user_id = auth.uid());

create policy "Admins can view team members" on public.team_members
  for select using (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_members.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

create policy "Users can join teams" on public.team_members
  for insert with check (user_id = auth.uid());

create policy "Users can leave teams" on public.team_members
  for delete using (user_id = auth.uid());

create policy "Admins can remove members" on public.team_members
  for delete using (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_members.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

create policy "Admins can update member roles" on public.team_members
  for update using (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_members.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

-- TEAM WEEKLY REVIEWS
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_weekly_reviews') THEN
    DROP POLICY IF EXISTS "Members can insert reviews" ON public.team_weekly_reviews;
    DROP POLICY IF EXISTS "Users can view own reviews" ON public.team_weekly_reviews;
  END IF;
END $$;

create policy "Members can insert reviews" on public.team_weekly_reviews
  for insert with check (
    exists (select 1 from public.team_members where team_id = public.team_weekly_reviews.team_id and user_id = auth.uid())
  );

create policy "Users can view own reviews" on public.team_weekly_reviews
  for select using (user_id = auth.uid());

-- TEAM CONSOLIDATED REPORTS
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_consolidated_reports') THEN
    DROP POLICY IF EXISTS "Team members can view reports" ON public.team_consolidated_reports;
    DROP POLICY IF EXISTS "Admins can insert reports" ON public.team_consolidated_reports;
    DROP POLICY IF EXISTS "Admins can update reports" ON public.team_consolidated_reports;
    DROP POLICY IF EXISTS "Admins can delete reports" ON public.team_consolidated_reports;
  END IF;
END $$;

create policy "Team members can view reports" on public.team_consolidated_reports
  for select using (
    exists (select 1 from public.team_members where team_id = public.team_consolidated_reports.team_id and user_id = auth.uid())
  );

create policy "Admins can insert reports" on public.team_consolidated_reports
  for insert with check (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_consolidated_reports.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

create policy "Admins can update reports" on public.team_consolidated_reports
  for update using (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_consolidated_reports.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

create policy "Admins can delete reports" on public.team_consolidated_reports
  for delete using (
    exists (select 1 from public.team_members tm where tm.team_id = public.team_consolidated_reports.team_id and tm.user_id = auth.uid() and tm.role = 'admin')
  );

-- ANALYTICS CACHE
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_cache') THEN
    DROP POLICY IF EXISTS "Users can view own cache" ON public.analytics_cache;
    DROP POLICY IF EXISTS "Users can manage own cache" ON public.analytics_cache;
  END IF;
END $$;

create policy "Users can view own cache" on public.analytics_cache
  for select using (user_id = auth.uid());

create policy "Users can manage own cache" on public.analytics_cache
  for all using (user_id = auth.uid());

-- CLEANUP JOB (Attempt to schedule if pg_cron exists)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'cleanup-analytics-cache',
      '0 0 * * *',
      'delete from public.analytics_cache where created_at < now() - interval ''24 hours'''
    );
  end if;
exception
  when others then null; -- Ignore if pg_cron not available or permission denied
end
$$;

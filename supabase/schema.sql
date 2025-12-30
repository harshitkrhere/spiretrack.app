-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  timezone text default 'UTC',
  language text default 'en' check (language in ('en', 'hin')),
  reminder_day text default 'sun',
  reminder_time time default '20:00',
  plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WEEKLY REVIEWS TABLE
create table public.weekly_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  week_start_date date not null,
  status text default 'draft' check (status in ('draft', 'completed')),
  answers jsonb default '{}'::jsonb,
  ai_output jsonb,
  scores jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DAILY CHECKINS TABLE
create table public.daily_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  mood_score int check (mood_score between 1 and 10),
  notes text,
  completed_tasks jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- PATTERNS TABLE
create table public.patterns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  analysis_date timestamptz default now(),
  summary_tags text[],
  suggestions text[]
);

-- SETTINGS TABLE
create table public.settings (
  user_id uuid references public.users(id) on delete cascade not null primary key,
  email_reminders_enabled boolean default true,
  theme_preference text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ADMIN METRICS TABLE
create table public.admin_metrics (
  id uuid default uuid_generate_v4() primary key,
  metric_name text not null,
  value numeric not null,
  timestamp timestamptz default now()
);

-- RLS POLICIES

-- Users: Users can view and update their own profile
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Weekly Reviews: Users can CRUD their own reviews
alter table public.weekly_reviews enable row level security;
create policy "Users can view own reviews" on public.weekly_reviews for select using (auth.uid() = user_id);
create policy "Users can insert own reviews" on public.weekly_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.weekly_reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.weekly_reviews for delete using (auth.uid() = user_id);

-- Daily Checkins: Users can CRUD their own checkins
alter table public.daily_checkins enable row level security;
create policy "Users can view own checkins" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.daily_checkins for update using (auth.uid() = user_id);

-- Patterns: Users can view their own patterns
alter table public.patterns enable row level security;
create policy "Users can view own patterns" on public.patterns for select using (auth.uid() = user_id);

-- Settings: Users can view and update their own settings
alter table public.settings enable row level security;
create policy "Users can view own settings" on public.settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.settings for insert with check (auth.uid() = user_id);

-- Admin Metrics: Only service role or specific admin users (logic to be added if needed)
alter table public.admin_metrics enable row level security;
-- No public access policies for admin_metrics

-- FUNCTIONS & TRIGGERS

-- Handle new user signup (create user profile and settings)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  insert into public.settings (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

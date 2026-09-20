-- ==============================================================================
-- ZENIN PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE
-- Migration: 20260915000000_init_zenin_schema.sql
-- ==============================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 2. PROFILES TABLE (Linked directly to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  display_name text not null default 'Hunter',
  avatar_url text,
  level integer not null default 1,
  rank text not null default 'NOVICE',
  current_xp integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  productivity_score integer not null default 0,
  streak_freeze_available integer not null default 1,
  last_active_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_phone on public.profiles(phone);

-- 3. MISSIONS TABLE
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  priority text not null default 'COMMON',
  category_id text not null default 'cat-work',
  status text not null default 'active',
  due_date text,
  due_time text,
  start_date text,
  reminder_time text,
  recurrence text not null default 'none',
  recurrence_interval integer default 1,
  xp_reward integer not null default 50,
  custom_xp boolean default false,
  estimated_duration integer default 30,
  notes text default '',
  subtasks jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  favorite boolean not null default false,
  archived boolean not null default false,
  xp_awarded boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_missions_user_id on public.missions(user_id);
create index if not exists idx_missions_status on public.missions(status);
create index if not exists idx_missions_due_date on public.missions(due_date);
create index if not exists idx_missions_updated_at on public.missions(updated_at);

-- 4. FOCUS SESSIONS TABLE
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text,
  mission_title text,
  duration_minutes integer not null default 25,
  xp_earned integer not null default 50,
  session_type text not null default 'pomodoro',
  started_at timestamptz,
  completed_at timestamptz not null default now()
);

create index if not exists idx_focus_sessions_user_id on public.focus_sessions(user_id);
create index if not exists idx_focus_sessions_completed_at on public.focus_sessions(completed_at);

-- 5. USER ACHIEVEMENTS TABLE
create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  progress integer not null default 0,
  primary key (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);

-- 6. XP TRANSACTIONS TABLE (IMMUTABLE ANTI-CHEAT LEDGER)
create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text,
  amount integer not null,
  reason text not null,
  unique_event_id text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_xp_tx_user_id on public.xp_transactions(user_id);
create index if not exists idx_xp_tx_unique_event on public.xp_transactions(unique_event_id);

-- 7. USER SETTINGS TABLE
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 8. SYNC METADATA TABLE
create table if not exists public.sync_metadata (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  last_synced_at timestamptz not null default now(),
  client_version text default '1.0.0'
);

-- ==============================================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.user_settings enable row level security;
alter table public.sync_metadata enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

create policy "Users can view own missions" on public.missions
  for select using (auth.uid() = user_id);

create policy "Users can insert own missions" on public.missions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own missions" on public.missions
  for update using (auth.uid() = user_id);

create policy "Users can delete own missions" on public.missions
  for delete using (auth.uid() = user_id);

create policy "Users can view own focus sessions" on public.focus_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own focus sessions" on public.focus_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);

create policy "Users can manage own achievements" on public.user_achievements
  for all using (auth.uid() = user_id);

create policy "Users can view own xp transactions" on public.xp_transactions
  for select using (auth.uid() = user_id);

create policy "Users can record own xp transactions" on public.xp_transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can manage own settings" on public.user_settings
  for all using (auth.uid() = user_id);

create policy "Users can manage own sync metadata" on public.sync_metadata
  for all using (auth.uid() = user_id);

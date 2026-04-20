-- Migration: add onboarding + streak columns to user_preferences
-- Run this in Supabase SQL Editor

-- 1. Create table if it doesn't exist yet
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  dashboard_widgets jsonb,
  journal_fields jsonb,
  account_balance numeric(20, 2),
  is_admin boolean default false,
  daily_scan_date text,
  daily_scan_count integer default 0,
  onboarding_completed boolean default false,
  market text,
  account_type text,
  biggest_problem text,
  daily_trade_limit integer,
  monthly_pnl_target numeric(20, 2),
  trading_streak integer default 0,
  last_logged_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Add new columns if the table already existed
alter table public.user_preferences
  add column if not exists onboarding_completed boolean default false,
  add column if not exists market text,
  add column if not exists account_type text,
  add column if not exists biggest_problem text,
  add column if not exists daily_trade_limit integer,
  add column if not exists monthly_pnl_target numeric(20, 2),
  add column if not exists trading_streak integer default 0,
  add column if not exists last_logged_date date;

-- 3. Enable RLS
alter table public.user_preferences enable row level security;

-- 4. Drop any stale policies before recreating them
drop policy if exists "Users can view own preferences"    on public.user_preferences;
drop policy if exists "Users can insert own preferences"  on public.user_preferences;
drop policy if exists "Users can update own preferences"  on public.user_preferences;
drop policy if exists "Service role can manage preferences" on public.user_preferences;

-- 5. Users can only access their own row
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- 6. Service role bypass (used by admin client in API routes)
create policy "Service role can manage preferences"
  on public.user_preferences for all
  using (true)
  with check (true);

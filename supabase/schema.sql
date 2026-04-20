-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trades table
create table if not exists public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  pair text not null,
  type text not null check (type in ('BUY', 'SELL')),
  entry_price numeric(20, 8) not null,
  exit_price numeric(20, 8),
  stop_loss numeric(20, 8),
  take_profit numeric(20, 8),
  lot_size numeric(20, 8),
  pnl numeric(20, 2),
  notes text,
  screenshot_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS Policies
alter table public.trades enable row level security;
alter table public.subscriptions enable row level security;

-- Trades policies
create policy "Users can view own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger trades_updated_at
  before update on public.trades
  for each row execute procedure public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- User preferences table (onboarding, settings, streak)
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  dashboard_widgets jsonb,
  journal_fields jsonb,
  account_balance numeric(20, 2),
  is_admin boolean default false,
  daily_scan_date text,
  daily_scan_count integer default 0,
  -- Onboarding
  onboarding_completed boolean default false,
  market text,                    -- forex | crypto | stocks | futures | mixed
  account_type text,              -- prop | live | both
  biggest_problem text,           -- overtrading | revenge_trading | bad_entries | cutting_winners | emotional
  daily_trade_limit integer,
  monthly_pnl_target numeric(20, 2),
  -- Streak
  trading_streak integer default 0,
  last_logged_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Service role can manage preferences"
  on public.user_preferences for all
  using (true)
  with check (true);

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage policy
create policy "Authenticated users can upload screenshots"
  on storage.objects for insert
  with check (bucket_id = 'screenshots' and auth.role() = 'authenticated');

create policy "Public can view screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Users can delete own screenshots"
  on storage.objects for delete
  using (bucket_id = 'screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

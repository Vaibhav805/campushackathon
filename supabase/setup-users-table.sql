-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Creates the users table and RLS policies

-- Users table (id matches auth.users.id)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  year text not null default '',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  goal text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.users enable row level security;

-- Users can only read/update their own profile
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow authenticated users to read other users' profiles (for suggested connections)
drop policy if exists "Users can read other users for connections" on public.users;
create policy "Users can read other users for connections"
  on public.users for select
  using (
    auth.uid() is not null
    and id != auth.uid()
  );

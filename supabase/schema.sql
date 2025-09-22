-- Users are managed by Supabase Auth. These tables extend app data.

-- User profiles table for storing additional user information
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  first_name text,
  last_name text,
  email text,
  phone text,
  state text,
  district text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  area_ha numeric,
  location jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  farm_id uuid references public.farms(id) on delete cascade,
  season text,
  crop text,
  yield_t_ha numeric,
  notes text,
  recorded_at date default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  farm_id uuid references public.farms(id) on delete cascade,
  type text check (type in ('weather','market','pest')),
  title text not null,
  message text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  language text default 'en',
  notifications boolean default true,
  created_at timestamp with time zone default now()
);

-- Chat history table for storing AI conversations
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  query text not null,
  response text not null,
  location jsonb,
  timestamp timestamp with time zone default now()
);

-- Basic RLS
alter table public.farms enable row level security;
alter table public.history enable row level security;
alter table public.user_profiles enable row level security;
alter table public.alerts enable row level security;
alter table public.preferences enable row level security;
alter table public.chat_history enable row level security;

create policy if not exists "owner-select-user-profiles" on public.user_profiles for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-user-profiles" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "owner-select-farms" on public.farms for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-farms" on public.farms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "owner-select-history" on public.history for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-history" on public.history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "owner-select-alerts" on public.alerts for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-alerts" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "owner-select-preferences" on public.preferences for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-preferences" on public.preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "owner-select-chat-history" on public.chat_history for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-chat-history" on public.chat_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);






-- Migration: Add user_profiles table
-- This migration adds the user_profiles table to store additional user information

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

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create RLS policies
create policy if not exists "owner-select-user-profiles" on public.user_profiles for select using (auth.uid() = user_id);
create policy if not exists "owner-modify-user-profiles" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create index for better performance
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);




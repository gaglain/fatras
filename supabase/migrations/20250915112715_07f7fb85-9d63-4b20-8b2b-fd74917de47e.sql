-- Create email_accounts table for connected email accounts
create extension if not exists pgcrypto;

-- Reusable updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Create table
create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('gmail','outlook','imap')),
  email text not null,
  access_token text,
  imap_config jsonb,
  is_active boolean not null default true,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_email unique (user_id, email)
);

-- Indexes
create index if not exists idx_email_accounts_user on public.email_accounts(user_id);
create index if not exists idx_email_accounts_email on public.email_accounts(email);

-- RLS
alter table public.email_accounts enable row level security;

drop policy if exists "email_accounts_select_own" on public.email_accounts;
drop policy if exists "email_accounts_insert_own" on public.email_accounts;
drop policy if exists "email_accounts_update_own" on public.email_accounts;
drop policy if exists "email_accounts_delete_own" on public.email_accounts;

create policy "email_accounts_select_own"
  on public.email_accounts for select
  using (auth.uid() = user_id);

create policy "email_accounts_insert_own"
  on public.email_accounts for insert
  with check (auth.uid() = user_id);

create policy "email_accounts_update_own"
  on public.email_accounts for update
  using (auth.uid() = user_id);

create policy "email_accounts_delete_own"
  on public.email_accounts for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger trg_email_accounts_updated_at
before update on public.email_accounts
for each row execute function public.update_updated_at_column();
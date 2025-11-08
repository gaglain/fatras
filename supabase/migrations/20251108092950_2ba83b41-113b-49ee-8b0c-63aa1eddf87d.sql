-- Roadshow expenses table and storage bucket setup

-- Create table for roadshow expenses
create table if not exists public.roadshow_expenses (
  id uuid primary key default gen_random_uuid(),
  roadshow_stop_id uuid not null,
  user_id uuid not null,
  title text not null,
  description text,
  amount numeric,
  file_url text not null,
  file_type text not null check (file_type in ('image','pdf')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional FK to roadshow_stops if table exists
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'roadshow_stops'
  ) then
    execute 'alter table public.roadshow_expenses
      drop constraint if exists roadshow_expenses_roadshow_stop_id_fkey';
    execute 'alter table public.roadshow_expenses
      add constraint roadshow_expenses_roadshow_stop_id_fkey
      foreign key (roadshow_stop_id) references public.roadshow_stops(id) on delete cascade';
  end if;
end $$;

-- Enable RLS
alter table public.roadshow_expenses enable row level security;

-- Policies: owners can manage their own expenses
drop policy if exists "Users can view their own roadshow expenses" on public.roadshow_expenses;
create policy "Users can view their own roadshow expenses"
  on public.roadshow_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own roadshow expenses" on public.roadshow_expenses;
create policy "Users can insert their own roadshow expenses"
  on public.roadshow_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own roadshow expenses" on public.roadshow_expenses;
create policy "Users can update their own roadshow expenses"
  on public.roadshow_expenses for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own roadshow expenses" on public.roadshow_expenses;
create policy "Users can delete their own roadshow expenses"
  on public.roadshow_expenses for delete
  using (auth.uid() = user_id);

-- Update updated_at trigger
drop trigger if exists roadshow_expenses_set_updated_at on public.roadshow_expenses;

create or replace function public.update_roadshow_expenses_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger roadshow_expenses_set_updated_at
before update on public.roadshow_expenses
for each row execute function public.update_roadshow_expenses_updated_at();

-- Create storage bucket for expenses (public to allow viewing via public URL)
insert into storage.buckets (id, name, public)
values ('roadshow-expenses', 'roadshow-expenses', true)
on conflict (id) do nothing;

-- Storage policies for the bucket
-- Public read access to view uploaded receipts
drop policy if exists "Roadshow expenses are publicly accessible" on storage.objects;
create policy "Roadshow expenses are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'roadshow-expenses');

-- Users can upload into their own folder: <user_id>/<roadshow_stop_id>/<filename>
drop policy if exists "Users can upload their own roadshow expenses" on storage.objects;
create policy "Users can upload their own roadshow expenses"
  on storage.objects for insert
  with check (
    bucket_id = 'roadshow-expenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own files
drop policy if exists "Users can update their own roadshow expenses" on storage.objects;
create policy "Users can update their own roadshow expenses"
  on storage.objects for update
  using (
    bucket_id = 'roadshow-expenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own roadshow expenses" on storage.objects;
drop policy if exists "Users can delete their own roadshow expenses" on storage.objects;
create policy "Users can delete their own roadshow expenses"
  on storage.objects for delete
  using (
    bucket_id = 'roadshow-expenses'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
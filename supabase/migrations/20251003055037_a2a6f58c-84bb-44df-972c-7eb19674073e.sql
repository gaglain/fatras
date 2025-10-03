-- Fix infinite recursion in RLS by using SECURITY DEFINER helper functions

-- 1) Helper functions (security definer bypass RLS)
create or replace function public.is_member_of_channel(_channel_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.messaging_channel_members m
    where m.channel_id = _channel_id and m.user_id = _user_id
  );
$$;

create or replace function public.is_owner_of_channel(_channel_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.messaging_channels c
    where c.id = _channel_id and c.user_id = _user_id
  );
$$;

create or replace function public.is_public_active_channel(_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.messaging_channels c
    where c.id = _channel_id and c.type = 'public' and c.is_active = true
  );
$$;

-- 2) Drop all policies on messaging_channel_members
drop policy if exists "members_select_visible_to_channel_members" on public.messaging_channel_members;
drop policy if exists "members_select_self_or_channel_member_or_owner" on public.messaging_channel_members;
drop policy if exists "members_insert_join_public_or_owner" on public.messaging_channel_members;
drop policy if exists "members_insert_join_public_or_owner_v2" on public.messaging_channel_members;
drop policy if exists "members_delete_self_or_owner" on public.messaging_channel_members;
drop policy if exists "members_delete_self_or_owner_v2" on public.messaging_channel_members;

-- 3) Recreate RLS policies using helper functions
create policy "members_select_own_or_cohabitants"
on public.messaging_channel_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_member_of_channel(channel_id, auth.uid())
  or public.is_owner_of_channel(channel_id, auth.uid())
);

create policy "members_insert_self_if_public_or_owner"
on public.messaging_channel_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    public.is_public_active_channel(channel_id)
    or public.is_owner_of_channel(channel_id, auth.uid())
  )
);

create policy "members_delete_self_or_channel_owner"
on public.messaging_channel_members
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_owner_of_channel(channel_id, auth.uid())
);

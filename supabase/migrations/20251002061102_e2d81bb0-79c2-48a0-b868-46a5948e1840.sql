-- Cleanup: Drop all existing conflicting policies on messaging tables
DROP POLICY IF EXISTS "All authenticated users can manage all channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel members can view channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel owners can delete their channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel owners can manage their channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel owners can update their channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can create messaging channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can create their own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can manage their own channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can view channels they own" ON public.messaging_channels;

DROP POLICY IF EXISTS "Channel owners can manage members" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can view channel members" ON public.messaging_channel_members;

DROP POLICY IF EXISTS "Channel members can view messages" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can send messages to their channels" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messaging_messages;

-- CHANNELS: members or owner can read; only owner can insert/update/delete
CREATE POLICY "channels_select_members_or_owner"
ON public.messaging_channels
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.messaging_channel_members m
    WHERE m.channel_id = messaging_channels.id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "channels_insert_owner_only"
ON public.messaging_channels
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "channels_update_owner_only"
ON public.messaging_channels
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "channels_delete_owner_only"
ON public.messaging_channels
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- MEMBERS: members/owners can read membership; users can join public channels; owners can add/remove
CREATE POLICY "members_select_visible_to_channel_members"
ON public.messaging_channel_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.messaging_channel_members m2
    WHERE m2.channel_id = messaging_channel_members.channel_id AND m2.user_id = auth.uid()
  )
);

CREATE POLICY "members_insert_join_public_or_owner"
ON public.messaging_channel_members
FOR INSERT
TO authenticated
WITH CHECK (
  (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.messaging_channels c
      WHERE c.id = channel_id AND c.type = 'public' AND c.is_active = true
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.messaging_channels c
    WHERE c.id = channel_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "members_delete_self_or_owner"
ON public.messaging_channel_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.messaging_channels c
    WHERE c.id = messaging_channel_members.channel_id AND c.user_id = auth.uid()
  )
);

-- MESSAGES: only channel members can read/insert; authors can update; author or channel owner can delete
CREATE POLICY "messages_select_by_membership"
ON public.messaging_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members m
    WHERE m.channel_id = messaging_messages.channel_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "messages_insert_by_membership"
ON public.messaging_messages
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.messaging_channel_members m
    WHERE m.channel_id = messaging_messages.channel_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "messages_update_by_author"
ON public.messaging_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "messages_delete_by_author_or_owner"
ON public.messaging_messages
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.messaging_channels c
    WHERE c.id = messaging_messages.channel_id AND c.user_id = auth.uid()
  )
);

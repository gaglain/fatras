-- Fix 1: Allow any authenticated user to create notifications for other users
-- This is needed when assigning someone to a roadshow stop
DROP POLICY IF EXISTS "Users can create notifications for themselves only" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create system notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 2: Allow channel owners and admins to add members to channels
DROP POLICY IF EXISTS "members_insert_self_if_public_or_admin" ON public.messaging_channel_members;

CREATE POLICY "members_insert_self_or_channel_owner"
  ON public.messaging_channel_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves to public channels
    (user_id = auth.uid() AND is_public_active_channel(channel_id))
    -- Channel owner can add anyone
    OR is_owner_of_channel(channel_id, auth.uid())
    -- Super admin can add anyone
    OR has_role(auth.uid(), 'super_admin'::app_role)
    -- Admin/manager can add anyone (for roadshow assignments)
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
  );

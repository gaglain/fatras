-- 1) Allow super_admin to update any channel (for deletion)
DROP POLICY IF EXISTS "Super admins can delete any channel" ON messaging_channels;
CREATE POLICY "Super admins can delete any channel" ON messaging_channels
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2) Allow super_admin and channel members to send messages
DROP POLICY IF EXISTS "Super admins can send messages in any channel" ON messaging_messages;
CREATE POLICY "Super admins can send messages in any channel" ON messaging_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM messaging_channel_members 
      WHERE channel_id = messaging_messages.channel_id 
      AND user_id = auth.uid()
    )
  )
);

-- 3) Deactivate the OLD general channel (created by other user)
UPDATE messaging_channels 
SET is_active = false 
WHERE id = 'c09bc61e-bf09-4a50-bc60-ce7fc59fd748';

-- 4) Re-activate YOUR general channel  
UPDATE messaging_channels 
SET is_active = true 
WHERE id = 'b08ac8ea-6c5e-430c-9fc0-8eaaec393534';
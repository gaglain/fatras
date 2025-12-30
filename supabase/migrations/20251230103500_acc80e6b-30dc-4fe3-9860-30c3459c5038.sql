-- Allow channel admins (members with role='admin') to update channels they're admin of
DROP POLICY IF EXISTS "Channel admins can update channels" ON messaging_channels;
CREATE POLICY "Channel admins can update channels" ON messaging_channels
FOR UPDATE
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM messaging_channel_members 
    WHERE channel_id = messaging_channels.id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM messaging_channel_members 
    WHERE channel_id = messaging_channels.id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);
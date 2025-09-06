-- Finaliser les politiques RLS pour la messagerie et autres tables collaboratives
DROP POLICY IF EXISTS "Users can view messages in channels they belong to" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can create messages in channels they belong to" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messaging_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messaging_messages;

-- Nouvelle politique pour les messages : tous les utilisateurs authentifiés peuvent voir et gérer tous les messages
CREATE POLICY "All authenticated users can manage all messages" 
ON public.messaging_messages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Modifier les politiques pour les canaux de messagerie
DROP POLICY IF EXISTS "Users can view channels they belong to" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can update channels they own" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can delete channels they own" ON public.messaging_channels;

CREATE POLICY "All authenticated users can manage all channels" 
ON public.messaging_channels 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Modifier les politiques pour les membres de canaux
DROP POLICY IF EXISTS "Users can view channel members for channels they belong to" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can add members to channels they own or admin" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can remove themselves from channels" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Channel admins can remove members" ON public.messaging_channel_members;

CREATE POLICY "All authenticated users can manage all channel members" 
ON public.messaging_channel_members 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
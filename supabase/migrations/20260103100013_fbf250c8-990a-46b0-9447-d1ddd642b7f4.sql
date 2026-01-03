
-- 1. Permettre à tous les utilisateurs authentifiés d'envoyer des messages dans les canaux publics actifs
DROP POLICY IF EXISTS "messages_insert_by_membership" ON public.messaging_messages;
DROP POLICY IF EXISTS "Super admins can send messages in any channel" ON public.messaging_messages;

-- Nouvelle politique: permet d'envoyer si membre OU si canal public actif
CREATE POLICY "messages_insert_member_or_public" 
ON public.messaging_messages 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND (
    -- Membre du canal
    EXISTS (
      SELECT 1 FROM messaging_channel_members m
      WHERE m.channel_id = messaging_messages.channel_id AND m.user_id = auth.uid()
    )
    -- OU canal public actif
    OR EXISTS (
      SELECT 1 FROM messaging_channels c
      WHERE c.id = messaging_messages.channel_id 
      AND c.type = 'public' 
      AND c.is_active = true
    )
  )
);

-- 2. Permettre de lire les messages des canaux publics actifs
DROP POLICY IF EXISTS "messages_select_by_membership" ON public.messaging_messages;

CREATE POLICY "messages_select_member_or_public" 
ON public.messaging_messages 
FOR SELECT 
USING (
  -- Membre du canal
  EXISTS (
    SELECT 1 FROM messaging_channel_members m
    WHERE m.channel_id = messaging_messages.channel_id AND m.user_id = auth.uid()
  )
  -- OU canal public actif
  OR EXISTS (
    SELECT 1 FROM messaging_channels c
    WHERE c.id = messaging_messages.channel_id 
    AND c.type = 'public' 
    AND c.is_active = true
  )
);

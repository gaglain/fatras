
-- 1. CONTACTS: Permettre à tous les utilisateurs authentifiés de voir les contacts
DROP POLICY IF EXISTS "Users view own or super_admin views all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;

-- Nouvelle politique: Tous les authentifiés peuvent voir tous les contacts
CREATE POLICY "Authenticated users can view all contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. OPPORTUNITIES: Permettre à tous les utilisateurs authentifiés de voir les opportunités
DROP POLICY IF EXISTS "Admins/managers can view opportunities" ON public.opportunities;

CREATE POLICY "Authenticated users can view all opportunities" 
ON public.opportunities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. MESSAGING_CHANNELS: Ajouter une politique pour voir les canaux publics
DROP POLICY IF EXISTS "channels_select_members_or_owner" ON public.messaging_channels;

CREATE POLICY "channels_select_public_or_member" 
ON public.messaging_channels 
FOR SELECT 
USING (
  -- Canal public actif
  (type = 'public' AND is_active = true)
  -- OU propriétaire
  OR (user_id = auth.uid())
  -- OU membre du canal
  OR (EXISTS (
    SELECT 1 FROM messaging_channel_members m
    WHERE m.channel_id = messaging_channels.id AND m.user_id = auth.uid()
  ))
  -- OU super_admin
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4. MESSAGING_CHANNEL_MEMBERS: Permettre de rejoindre les canaux publics
DROP POLICY IF EXISTS "members_insert_self_if_public_or_owner" ON public.messaging_channel_members;

CREATE POLICY "members_insert_self_if_public_or_admin" 
ON public.messaging_channel_members 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND (
    -- Canal public actif
    EXISTS (
      SELECT 1 FROM messaging_channels c 
      WHERE c.id = channel_id AND c.type = 'public' AND c.is_active = true
    )
    -- OU propriétaire du canal
    OR EXISTS (
      SELECT 1 FROM messaging_channels c 
      WHERE c.id = channel_id AND c.user_id = auth.uid()
    )
    -- OU super_admin
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

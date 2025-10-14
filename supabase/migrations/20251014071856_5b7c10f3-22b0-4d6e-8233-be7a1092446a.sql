-- Ajouter une colonne pour lier les roadshow stops aux opportunités et quotes
ALTER TABLE roadshow_stops ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;
ALTER TABLE roadshow_stops ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_opportunity_id ON roadshow_stops(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_quote_id ON roadshow_stops(quote_id);

-- Mettre à jour les RLS pour les roadshow_stops pour permettre l'accès aux membres du casting et super admin
DROP POLICY IF EXISTS "Users can manage own roadshow stops" ON roadshow_stops;

-- Nouvelle politique: propriétaire peut tout faire
CREATE POLICY "Owner can manage roadshow stops"
ON roadshow_stops
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Nouvelle politique: membres du casting peuvent voir et modifier
CREATE POLICY "Casting members can view and edit roadshow stops"
ON roadshow_stops
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(artist_lineup) AS lineup_member
    WHERE (lineup_member->>'userId')::uuid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(artist_lineup) AS lineup_member
    WHERE (lineup_member->>'userId')::uuid = auth.uid()
  )
);

-- Nouvelle politique: super admin peut tout voir
CREATE POLICY "Super admin can manage all roadshow stops"
ON roadshow_stops
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

-- Mettre à jour les RLS pour les canaux de messagerie liés aux roadshows
DROP POLICY IF EXISTS "channels_select_members_or_owner" ON messaging_channels;

CREATE POLICY "channels_select_members_or_owner"
ON messaging_channels
FOR SELECT
USING (
  -- Propriétaire du canal
  user_id = auth.uid()
  OR
  -- Membre du canal
  EXISTS (
    SELECT 1
    FROM messaging_channel_members m
    WHERE m.channel_id = messaging_channels.id
    AND m.user_id = auth.uid()
  )
  OR
  -- Super admin
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
  OR
  -- Membre du casting du roadshow associé
  (
    roadshow_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM roadshow_stops rs
      WHERE rs.id = messaging_channels.roadshow_id
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(rs.artist_lineup) AS lineup_member
        WHERE (lineup_member->>'userId')::uuid = auth.uid()
      )
    )
  )
);
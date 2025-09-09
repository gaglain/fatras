-- Mettre à jour les politiques RLS pour permettre l'accès à tous les utilisateurs authentifiés

-- 1. Politiques pour la table tasks
DROP POLICY IF EXISTS "All authenticated users can manage all tasks" ON public.tasks;
CREATE POLICY "All authenticated users can manage all tasks" 
ON public.tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Politiques pour la table events  
DROP POLICY IF EXISTS "All authenticated users can manage all events" ON public.events;
CREATE POLICY "All authenticated users can manage all events" 
ON public.events 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Politiques pour la table contacts
DROP POLICY IF EXISTS "All authenticated users can manage all contacts" ON public.contacts;
CREATE POLICY "All authenticated users can manage all contacts" 
ON public.contacts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Politiques pour la table centralized_events
DROP POLICY IF EXISTS "Users can manage own centralized events" ON public.centralized_events;
CREATE POLICY "All authenticated users can manage all centralized events" 
ON public.centralized_events 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Politiques pour la table centralized_artists
DROP POLICY IF EXISTS "Users can manage own centralized artists" ON public.centralized_artists;
CREATE POLICY "All authenticated users can manage all centralized artists" 
ON public.centralized_artists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. Politiques pour la table publications
DROP POLICY IF EXISTS "Users can manage own publications" ON public.publications;
DROP POLICY IF EXISTS "Users can manage their own publications" ON public.publications;
CREATE POLICY "All authenticated users can manage all publications" 
ON public.publications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 7. Politiques pour la table opportunities
DROP POLICY IF EXISTS "All authenticated users can manage all opportunities" ON public.opportunities;
CREATE POLICY "All authenticated users can manage all opportunities" 
ON public.opportunities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. Politiques pour la table quotes
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "All authenticated users can manage all quotes" 
ON public.quotes 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 9. Politiques pour la table campaigns
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "All authenticated users can manage all campaigns" 
ON public.campaigns 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 10. Politiques pour la table email_campaigns
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;
CREATE POLICY "All authenticated users can manage all email campaigns" 
ON public.email_campaigns 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 11. Politiques pour la table roadshow_stops
DROP POLICY IF EXISTS "Users can create their own roadshow stops" ON public.roadshow_stops;
DROP POLICY IF EXISTS "Users can view their own roadshow stops" ON public.roadshow_stops;
DROP POLICY IF EXISTS "Users can update their own roadshow stops" ON public.roadshow_stops;
DROP POLICY IF EXISTS "Users can delete their own roadshow stops" ON public.roadshow_stops;
CREATE POLICY "All authenticated users can manage all roadshow stops" 
ON public.roadshow_stops 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 12. Politiques pour la table event_types
DROP POLICY IF EXISTS "Users can manage own event types" ON public.event_types;
CREATE POLICY "All authenticated users can manage all event types" 
ON public.event_types 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 13. Table notifications - S'assurer qu'elle existe et a les bonnes politiques
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour notifications
DROP POLICY IF EXISTS "All authenticated users can manage all notifications" ON public.notifications;
CREATE POLICY "All authenticated users can manage all notifications" 
ON public.notifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
-- Nettoyer et recréer toutes les politiques RLS pour une visibilité complète

-- Tasks: Supprimer les anciennes politiques et en créer une nouvelle
DROP POLICY IF EXISTS "All authenticated users can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.tasks;

CREATE POLICY "Enable all access for authenticated users on tasks"
  ON public.tasks FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Events: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all events" ON public.events;
DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.events;

CREATE POLICY "Enable all access for authenticated users on events"
  ON public.events FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contacts: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.contacts;

CREATE POLICY "Enable all access for authenticated users on contacts"
  ON public.contacts FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Centralized Events: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all centralized events" ON public.centralized_events;
DROP POLICY IF EXISTS "Users can manage own centralized events" ON public.centralized_events;

CREATE POLICY "Enable all access for authenticated users on centralized_events"
  ON public.centralized_events FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Centralized Artists: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all artists" ON public.centralized_artists;
DROP POLICY IF EXISTS "All authenticated users can manage all centralized artists" ON public.centralized_artists;
DROP POLICY IF EXISTS "Users can manage own centralized artists" ON public.centralized_artists;

CREATE POLICY "Enable all access for authenticated users on centralized_artists"
  ON public.centralized_artists FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Publications: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all publications" ON public.publications;
DROP POLICY IF EXISTS "Users can manage own publications" ON public.publications;

CREATE POLICY "Enable all access for authenticated users on publications"
  ON public.publications FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Opportunities: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can manage own opportunities" ON public.opportunities;

CREATE POLICY "Enable all access for authenticated users on opportunities"
  ON public.opportunities FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Quotes: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;

CREATE POLICY "Enable all access for authenticated users on quotes"
  ON public.quotes FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Campaigns: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;

CREATE POLICY "Enable all access for authenticated users on campaigns"
  ON public.campaigns FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email Campaigns: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can manage own email campaigns" ON public.email_campaigns;

CREATE POLICY "Enable all access for authenticated users on email_campaigns"
  ON public.email_campaigns FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Roadshow Stops: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all roadshow stops" ON public.roadshow_stops;
DROP POLICY IF EXISTS "Users can manage own roadshow stops" ON public.roadshow_stops;

CREATE POLICY "Enable all access for authenticated users on roadshow_stops"
  ON public.roadshow_stops FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Event Types: Nettoyer et recréer
DROP POLICY IF EXISTS "All authenticated users can manage all event types" ON public.event_types;
DROP POLICY IF EXISTS "Users can manage own event types" ON public.event_types;

CREATE POLICY "Enable all access for authenticated users on event_types"
  ON public.event_types FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notifications: S'assurer que la table existe et a les bonnes politiques
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated users can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

CREATE POLICY "Enable all access for authenticated users on notifications"
  ON public.notifications FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
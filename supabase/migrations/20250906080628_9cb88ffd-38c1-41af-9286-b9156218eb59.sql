-- Modifier les politiques RLS pour permettre l'accès collaboratif

-- Supprimer les anciennes politiques restrictives pour les événements
DROP POLICY IF EXISTS "Users can manage own events" ON public.events;

-- Nouvelle politique pour les événements : tous les utilisateurs authentifiés peuvent voir et gérer tous les événements
CREATE POLICY "All authenticated users can manage all events" 
ON public.events 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les contacts
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;

-- Nouvelle politique pour les contacts : tous les utilisateurs authentifiés peuvent voir et gérer tous les contacts
CREATE POLICY "All authenticated users can manage all contacts" 
ON public.contacts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les artistes
DROP POLICY IF EXISTS "Users can manage own centralized artists" ON public.centralized_artists;

-- Nouvelle politique pour les artistes : tous les utilisateurs authentifiés peuvent voir et gérer tous les artistes
CREATE POLICY "All authenticated users can manage all artists" 
ON public.centralized_artists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les types d'événements
DROP POLICY IF EXISTS "Users can manage own event types" ON public.event_types;

-- Nouvelle politique pour les types d'événements : tous les utilisateurs authentifiés peuvent voir et gérer tous les types
CREATE POLICY "All authenticated users can manage all event types" 
ON public.event_types 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les tâches
DROP POLICY IF EXISTS "Users can manage own tasks and assigned tasks" ON public.tasks;

-- Nouvelle politique pour les tâches : tous les utilisateurs authentifiés peuvent voir et gérer toutes les tâches
CREATE POLICY "All authenticated users can manage all tasks" 
ON public.tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les opportunités
DROP POLICY IF EXISTS "Users can manage own opportunities" ON public.opportunities;

-- Nouvelle politique pour les opportunités : tous les utilisateurs authentifiés peuvent voir et gérer toutes les opportunités
CREATE POLICY "All authenticated users can manage all opportunities" 
ON public.opportunities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les publications
DROP POLICY IF EXISTS "Users can manage own publications" ON public.publications;
DROP POLICY IF EXISTS "Users can manage their own publications" ON public.publications;

-- Nouvelle politique pour les publications : tous les utilisateurs authentifiés peuvent voir et gérer toutes les publications
CREATE POLICY "All authenticated users can manage all publications" 
ON public.publications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Supprimer les anciennes politiques restrictives pour les devis
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;

-- Nouvelle politique pour les devis : tous les utilisateurs authentifiés peuvent voir et gérer tous les devis
CREATE POLICY "All authenticated users can manage all quotes" 
ON public.quotes 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Mettre à jour les politiques pour les éléments de devis
DROP POLICY IF EXISTS "Users can manage own quote items" ON public.quote_items;

CREATE POLICY "All authenticated users can manage all quote items" 
ON public.quote_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Mettre à jour les politiques pour les listes de contacts
DROP POLICY IF EXISTS "Users can manage own contact lists" ON public.contact_lists;

CREATE POLICY "All authenticated users can manage all contact lists" 
ON public.contact_lists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
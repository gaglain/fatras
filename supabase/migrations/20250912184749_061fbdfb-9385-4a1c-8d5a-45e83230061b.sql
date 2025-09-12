-- Mise à jour des politiques RLS pour permettre la collaboration comme HubSpot
-- Tous les utilisateurs authentifiés peuvent voir et modifier les données des autres

-- 1. CONTACTS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;

CREATE POLICY "Authenticated users can view all contacts" 
ON public.contacts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create contacts" 
ON public.contacts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all contacts" 
ON public.contacts 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all contacts" 
ON public.contacts 
FOR DELETE 
TO authenticated
USING (true);

-- 2. EVENTS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own events" ON public.events;

CREATE POLICY "Authenticated users can view all events" 
ON public.events 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all events" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all events" 
ON public.events 
FOR DELETE 
TO authenticated
USING (true);

-- 3. TASKS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view all tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (true);

-- 4. OPPORTUNITIES - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own opportunities" ON public.opportunities;

CREATE POLICY "Authenticated users can view all opportunities" 
ON public.opportunities 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create opportunities" 
ON public.opportunities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all opportunities" 
ON public.opportunities 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all opportunities" 
ON public.opportunities 
FOR DELETE 
TO authenticated
USING (true);

-- 5. QUOTES - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own quotes" ON public.quotes;

CREATE POLICY "Authenticated users can view all quotes" 
ON public.quotes 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create quotes" 
ON public.quotes 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all quotes" 
ON public.quotes 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all quotes" 
ON public.quotes 
FOR DELETE 
TO authenticated
USING (true);

-- 6. CENTRALIZED_EVENTS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own centralized events" ON public.centralized_events;

CREATE POLICY "Authenticated users can view all centralized events" 
ON public.centralized_events 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create centralized events" 
ON public.centralized_events 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all centralized events" 
ON public.centralized_events 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all centralized events" 
ON public.centralized_events 
FOR DELETE 
TO authenticated
USING (true);

-- 7. ROADSHOW_STOPS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own roadshow stops" ON public.roadshow_stops;

CREATE POLICY "Authenticated users can view all roadshow stops" 
ON public.roadshow_stops 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create roadshow stops" 
ON public.roadshow_stops 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all roadshow stops" 
ON public.roadshow_stops 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all roadshow stops" 
ON public.roadshow_stops 
FOR DELETE 
TO authenticated
USING (true);

-- 8. PUBLICATIONS - Accès collaboratif
DROP POLICY IF EXISTS "Users can manage their own publications" ON public.publications;

CREATE POLICY "Authenticated users can view all publications" 
ON public.publications 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create publications" 
ON public.publications 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all publications" 
ON public.publications 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all publications" 
ON public.publications 
FOR DELETE 
TO authenticated
USING (true);
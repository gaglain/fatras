-- Retenter la modification des politiques RLS pour permettre l'accès collaboratif
-- avec des transactions séparées pour éviter les deadlocks

-- Modifier les événements d'abord
DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
CREATE POLICY "All authenticated users can manage all events" 
ON public.events 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
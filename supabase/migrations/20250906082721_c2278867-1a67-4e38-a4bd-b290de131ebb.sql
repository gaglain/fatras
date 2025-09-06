-- Continuer la modification des politiques RLS pour les contacts et artistes
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
CREATE POLICY "All authenticated users can manage all contacts" 
ON public.contacts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own centralized artists" ON public.centralized_artists;
CREATE POLICY "All authenticated users can manage all artists" 
ON public.centralized_artists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
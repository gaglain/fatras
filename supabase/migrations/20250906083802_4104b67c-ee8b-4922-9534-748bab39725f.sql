-- Continuer la modification des politiques RLS pour les tâches et opportunités
DROP POLICY IF EXISTS "Users can manage own tasks and assigned tasks" ON public.tasks;
CREATE POLICY "All authenticated users can manage all tasks" 
ON public.tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own opportunities" ON public.opportunities;
CREATE POLICY "All authenticated users can manage all opportunities" 
ON public.opportunities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
-- Ajouter une policy pour que website_designs soit lisible par tous (pour le site public)
CREATE POLICY "Anyone can view website designs"
ON public.website_designs
FOR SELECT
USING (true);
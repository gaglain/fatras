-- Supprimer l'ancienne policy ALL qui est incomplète
DROP POLICY IF EXISTS "Users can manage own website seo" ON public.website_seo;

-- Créer des policies spécifiques pour chaque opération
CREATE POLICY "Users can view own website seo"
  ON public.website_seo
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website seo"
  ON public.website_seo
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website seo"
  ON public.website_seo
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own website seo"
  ON public.website_seo
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);
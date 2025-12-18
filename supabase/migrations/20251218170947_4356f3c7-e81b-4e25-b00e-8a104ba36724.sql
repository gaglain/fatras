-- Permettre l'accès public en lecture aux événements confirmés
CREATE POLICY "Public can view confirmed events"
ON public.events
FOR SELECT
TO anon
USING (status = 'confirmed');

-- Permettre l'accès public en lecture aux artistes en tournée
CREATE POLICY "Public can view touring artists"
ON public.centralized_artists
FOR SELECT
TO anon
USING (is_touring = true);
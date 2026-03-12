CREATE POLICY "Anonymous can view confirmed roadshow stops"
ON public.roadshow_stops
FOR SELECT
TO anon
USING (status = 'confirmed');
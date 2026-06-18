DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;

CREATE POLICY "Authenticated users can delete contacts"
ON public.contacts FOR DELETE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
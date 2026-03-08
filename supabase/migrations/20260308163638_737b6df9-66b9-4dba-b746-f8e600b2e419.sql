-- Fix: Restrict 7 tables from anonymous access to authenticated-only
-- These tables had SELECT policies with USING (true) on public role (anon+auth)
-- Replacing with auth.uid() IS NOT NULL to maintain team-wide sharing but block anonymous visitors

-- 1. contact_events
DROP POLICY IF EXISTS "Authenticated users can view contact_events" ON public.contact_events;
CREATE POLICY "Authenticated users can view contact_events" ON public.contact_events
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 2. contact_opportunities
DROP POLICY IF EXISTS "Authenticated users can view contact_opportunities" ON public.contact_opportunities;
CREATE POLICY "Authenticated users can view contact_opportunities" ON public.contact_opportunities
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 3. contact_quotes
DROP POLICY IF EXISTS "Authenticated users can view contact_quotes" ON public.contact_quotes;
CREATE POLICY "Authenticated users can view contact_quotes" ON public.contact_quotes
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 4. roadshow_contacts
DROP POLICY IF EXISTS "Authenticated users can view roadshow_contacts" ON public.roadshow_contacts;
CREATE POLICY "Authenticated users can view roadshow_contacts" ON public.roadshow_contacts
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 5. roadshow_documents
DROP POLICY IF EXISTS "Users can view roadshow documents" ON public.roadshow_documents;
CREATE POLICY "Users can view roadshow documents" ON public.roadshow_documents
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 6. roadshow_notes
DROP POLICY IF EXISTS "Users can view roadshow notes" ON public.roadshow_notes;
CREATE POLICY "Users can view roadshow notes" ON public.roadshow_notes
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- 7. task_entities
DROP POLICY IF EXISTS "Authenticated users can view task_entities" ON public.task_entities;
CREATE POLICY "Authenticated users can view task_entities" ON public.task_entities
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
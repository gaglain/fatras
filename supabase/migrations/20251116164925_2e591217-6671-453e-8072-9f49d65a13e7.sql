-- Allow authenticated users to read contact linkage tables to display related data in the UI
-- These policies are read-only and do not change existing insert/update/delete restrictions

-- Helper to create SELECT policy if table and policy do not already exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='contact_events' AND policyname='Authenticated users can view contact_events'
    ) THEN
      CREATE POLICY "Authenticated users can view contact_events"
      ON public.contact_events
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_opportunities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='contact_opportunities' AND policyname='Authenticated users can view contact_opportunities'
    ) THEN
      CREATE POLICY "Authenticated users can view contact_opportunities"
      ON public.contact_opportunities
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_quotes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='contact_quotes' AND policyname='Authenticated users can view contact_quotes'
    ) THEN
      CREATE POLICY "Authenticated users can view contact_quotes"
      ON public.contact_quotes
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;

-- Optional linkage tables used by the app; protect with conditional creation
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='task_entities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='task_entities' AND policyname='Authenticated users can view task_entities'
    ) THEN
      CREATE POLICY "Authenticated users can view task_entities"
      ON public.task_entities
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='roadshow_contacts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='roadshow_contacts' AND policyname='Authenticated users can view roadshow_contacts'
    ) THEN
      CREATE POLICY "Authenticated users can view roadshow_contacts"
      ON public.roadshow_contacts
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;
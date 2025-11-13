-- Enable collaborative read access across the org for key tables
-- This migration enables SELECT for all authenticated users on shared resources
-- and restricts modifications of app_settings to admins/super_admins via has_role()

-- Events (agenda)
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='events' AND policyname='Allow authenticated read events'
  ) THEN
    CREATE POLICY "Allow authenticated read events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Calendar events (Nylas sync store)
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='calendar_events' AND policyname='Allow authenticated read calendar_events'
  ) THEN
    CREATE POLICY "Allow authenticated read calendar_events"
    ON public.calendar_events
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Centralized events (if used in UI)
ALTER TABLE IF EXISTS public.centralized_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='centralized_events' AND policyname='Allow authenticated read centralized_events'
  ) THEN
    CREATE POLICY "Allow authenticated read centralized_events"
    ON public.centralized_events
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Emails (sent)
ALTER TABLE IF EXISTS public.emails ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='emails' AND policyname='Allow authenticated read emails'
  ) THEN
    CREATE POLICY "Allow authenticated read emails"
    ON public.emails
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Inbound emails (received)
ALTER TABLE IF EXISTS public.inbound_emails ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='inbound_emails' AND policyname='Allow authenticated read inbound_emails'
  ) THEN
    CREATE POLICY "Allow authenticated read inbound_emails"
    ON public.inbound_emails
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Show Bible documents
ALTER TABLE IF EXISTS public.show_bible_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='show_bible_documents' AND policyname='Allow authenticated read show_bible_documents'
  ) THEN
    CREATE POLICY "Allow authenticated read show_bible_documents"
    ON public.show_bible_documents
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- App settings (company name/logo/favicon etc.)
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;
-- Allow everyone in the org to read shared settings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='app_settings' AND policyname='Allow authenticated read app_settings'
  ) THEN
    CREATE POLICY "Allow authenticated read app_settings"
    ON public.app_settings
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Restrict modifications to admins/super_admins only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='app_settings' AND policyname='Admins can insert app_settings'
  ) THEN
    CREATE POLICY "Admins can insert app_settings"
    ON public.app_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='app_settings' AND policyname='Admins can update app_settings'
  ) THEN
    CREATE POLICY "Admins can update app_settings"
    ON public.app_settings
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='app_settings' AND policyname='Admins can delete app_settings'
  ) THEN
    CREATE POLICY "Admins can delete app_settings"
    ON public.app_settings
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;
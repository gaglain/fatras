-- Ensure unique index for upsert on app_settings
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_user_setting_key_uniq
ON public.app_settings (user_id, setting_key);

-- Create storage bucket for app assets (logos, favicons) if not exists
INSERT INTO storage.buckets (id, name, public)
SELECT 'app-assets', 'app-assets', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'app-assets'
);

-- Storage policies for app-assets bucket
-- Allow public read (since bucket is public) - optional but explicit
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read app-assets'
  ) THEN
    CREATE POLICY "Public read app-assets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'app-assets');
  END IF;
END $$;

-- Allow authenticated users to upload/update to app-assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated write app-assets'
  ) THEN
    CREATE POLICY "Authenticated write app-assets"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'app-assets');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update app-assets'
  ) THEN
    CREATE POLICY "Authenticated update app-assets"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'app-assets')
    WITH CHECK (bucket_id = 'app-assets');
  END IF;
END $$;

-- Optional: ensure RLS is enabled on storage.objects (it is by default in Supabase) and on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- App settings policies: users can upsert their own settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Users manage own settings'
  ) THEN
    CREATE POLICY "Users manage own settings"
    ON public.app_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
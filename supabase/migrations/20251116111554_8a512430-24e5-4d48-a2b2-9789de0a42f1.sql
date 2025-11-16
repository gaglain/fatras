-- Ensure public bucket for publication media and permissive policies for preview
-- 1) Ensure bucket exists and is public
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'publication-media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('publication-media', 'publication-media', true);
  ELSE
    UPDATE storage.buckets SET public = true WHERE id = 'publication-media';
  END IF;
END
$$;

-- 2) Public read access to objects in this bucket (for previews and front-site)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public can read publication-media'
  ) THEN
    CREATE POLICY "Public can read publication-media"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'publication-media');
  END IF;
END
$$;

-- 3) Allow authenticated users to upload to this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can upload publication-media'
  ) THEN
    CREATE POLICY "Authenticated can upload publication-media"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'publication-media');
  END IF;
END
$$;

-- 4) Allow authenticated users to update/delete their own files in this bucket (optional for management)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can modify publication-media'
  ) THEN
    CREATE POLICY "Authenticated can modify publication-media"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'publication-media')
    WITH CHECK (bucket_id = 'publication-media');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated can delete publication-media'
  ) THEN
    CREATE POLICY "Authenticated can delete publication-media"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'publication-media');
  END IF;
END
$$;

-- Policies pour le bucket artist-documents (manquantes)
CREATE POLICY "Users can upload their own artist documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artist-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM centralized_artists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own artist documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'artist-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM centralized_artists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own artist documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'artist-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM centralized_artists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own artist documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'artist-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM centralized_artists WHERE user_id = auth.uid()
  )
);
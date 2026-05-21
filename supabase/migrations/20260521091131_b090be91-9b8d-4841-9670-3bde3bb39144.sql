DROP POLICY IF EXISTS "Authenticated users can view roadshow expense files" ON storage.objects;

CREATE POLICY "Authenticated users can view roadshow expense files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'roadshow-expenses');
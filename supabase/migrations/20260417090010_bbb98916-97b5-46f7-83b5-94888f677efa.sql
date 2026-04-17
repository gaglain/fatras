
-- Make roadshow-expenses bucket private
UPDATE storage.buckets SET public = false WHERE id = 'roadshow-expenses';

-- Remove the public access policy
DROP POLICY IF EXISTS "Roadshow expenses are publicly accessible" ON storage.objects;

-- Add authenticated-only read policy (collaborative team model, matches roadshow_expenses table RLS)
CREATE POLICY "Authenticated users can view roadshow expense files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'roadshow-expenses');

-- Create email attachments storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-attachments', 'email-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to files in the email-attachments bucket
CREATE POLICY "Public can view email attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-attachments');

-- Allow authenticated users to upload to the email-attachments bucket
CREATE POLICY "Authenticated can upload email attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'email-attachments' AND auth.role() = 'authenticated');

-- Allow authenticated users to update files in the email-attachments bucket
CREATE POLICY "Authenticated can update email attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'email-attachments' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files in the email-attachments bucket
CREATE POLICY "Authenticated can delete email attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'email-attachments' AND auth.role() = 'authenticated');
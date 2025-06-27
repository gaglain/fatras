
-- Créer un bucket pour stocker les médias des publications
INSERT INTO storage.buckets (id, name, public)
VALUES ('publication-media', 'publication-media', true);

-- Créer des politiques pour le bucket publication-media
CREATE POLICY "Anyone can view publication media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'publication-media');

CREATE POLICY "Authenticated users can upload publication media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'publication-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their publication media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'publication-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their publication media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'publication-media' AND auth.role() = 'authenticated');

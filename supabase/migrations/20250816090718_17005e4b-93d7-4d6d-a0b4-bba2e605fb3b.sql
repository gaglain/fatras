-- Créer les politiques RLS pour le storage

-- Politique pour permettre aux utilisateurs authentifiés de lire les objets dans le bucket show-bible
CREATE POLICY "Allow authenticated users to read show-bible objects" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'show-bible' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader dans le bucket show-bible
CREATE POLICY "Allow authenticated users to upload to show-bible" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'show-bible' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de modifier leurs propres fichiers dans show-bible
CREATE POLICY "Allow authenticated users to update their own show-bible files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'show-bible' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres fichiers dans show-bible
CREATE POLICY "Allow authenticated users to delete show-bible files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'show-bible' AND auth.role() = 'authenticated');

-- Politiques similaires pour les autres buckets utilisés par l'app

-- app-files bucket (pour les documents)
CREATE POLICY "Allow authenticated users to read app-files objects" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload to app-files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'app-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their own app-files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'app-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete app-files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'app-files' AND auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de créer des buckets si nécessaire
CREATE POLICY "Allow authenticated users to create buckets" 
ON storage.buckets 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de lire les informations des buckets
CREATE POLICY "Allow authenticated users to read buckets" 
ON storage.buckets 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- S'assurer que les buckets nécessaires existent
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types) 
VALUES ('show-bible', 'show-bible', true, false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/*', 'video/*'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types) 
VALUES ('app-files', 'app-files', false, false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;
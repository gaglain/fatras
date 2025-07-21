-- Créer une table pour stocker les buckets de storage s'ils n'existent pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-documents', 'artist-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques pour le bucket artist-documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'artist-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'artist-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'artist-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'artist-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Améliorer la structure de la table artist_files si nécessaire
ALTER TABLE public.artist_files 
ADD COLUMN IF NOT EXISTS bucket_name text NOT NULL DEFAULT 'artist-documents';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_artist_files_user_artist ON public.artist_files(user_id, artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_files_category ON public.artist_files(category);
-- Créer le bucket pour les fichiers audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-audio', 'artist-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les fichiers audio d'artistes (publics)
CREATE POLICY "Artist audio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artist-audio');

CREATE POLICY "Users can upload artist audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artist-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update artist audio" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artist-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete artist audio" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artist-audio' AND auth.uid() IS NOT NULL);

-- Ajouter une colonne pour les fichiers audio dans centralized_artists
ALTER TABLE public.centralized_artists 
ADD COLUMN IF NOT EXISTS audio_files JSONB DEFAULT '[]'::jsonb;
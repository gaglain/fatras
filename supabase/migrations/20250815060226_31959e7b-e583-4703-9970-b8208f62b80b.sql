-- Créer le bucket pour les fichiers de la bible du spectacle
INSERT INTO storage.buckets (id, name, public) 
VALUES ('show-bible', 'show-bible', true);

-- Créer les politiques de storage pour la bible du spectacle
CREATE POLICY "Users can view their own bible files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'show-bible' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own bible files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'show-bible' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own bible files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'show-bible' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own bible files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'show-bible' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
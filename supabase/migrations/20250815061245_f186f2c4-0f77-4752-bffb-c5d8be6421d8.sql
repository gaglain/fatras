-- Créer le bucket pour les assets de l'application
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true);

-- Créer les politiques de storage pour les assets de l'app
CREATE POLICY "Users can view their own app assets" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'app-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own app assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'app-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own app assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'app-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own app assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'app-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
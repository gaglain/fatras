-- Créer un bucket pour les images du site web
INSERT INTO storage.buckets (id, name, public) VALUES ('website-images', 'website-images', true);

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des images
CREATE POLICY "Users can upload website images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-images' AND auth.uid() IS NOT NULL);

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Website images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-images');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own website images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-images' AND auth.uid() IS NOT NULL);

-- Politique pour permettre aux utilisateurs de modifier leurs propres images
CREATE POLICY "Users can update their own website images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-images' AND auth.uid() IS NOT NULL);
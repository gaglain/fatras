-- Créer des politiques pour permettre aux utilisateurs de gérer leurs avatars

-- Politique pour permettre aux utilisateurs de voir tous les avatars (car ils sont publics)
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leur avatar
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Politique pour permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Politique pour permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);
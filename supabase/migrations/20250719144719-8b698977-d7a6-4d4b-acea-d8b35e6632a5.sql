-- Créer les buckets de stockage pour les artistes
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('artist-documents', 'artist-documents', false),
  ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les photos d'artistes (publiques)
CREATE POLICY "Artist photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artist-photos');

CREATE POLICY "Users can upload artist photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artist-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update artist photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artist-photos' AND auth.uid() IS NOT NULL);

-- Politiques pour les documents d'artistes (privés)
CREATE POLICY "Users can view artist documents they uploaded" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload artist documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artist-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Table pour lier les fichiers aux artistes
CREATE TABLE IF NOT EXISTS public.artist_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_id UUID REFERENCES public.user_profiles(user_id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  bucket_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour artist_files
ALTER TABLE public.artist_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their artist files" 
ON public.artist_files 
FOR ALL 
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER handle_artist_files_updated_at
  BEFORE UPDATE ON public.artist_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
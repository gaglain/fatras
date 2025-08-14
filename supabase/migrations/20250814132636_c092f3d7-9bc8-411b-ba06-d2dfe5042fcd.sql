-- Créer une table pour stocker les documents de la bible du spectacle
CREATE TABLE public.show_bible_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('audio', 'video', 'image', 'text', 'pdf', 'other')),
  url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'show-bible',
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  file_size_display TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.show_bible_documents ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own bible documents" 
ON public.show_bible_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bible documents" 
ON public.show_bible_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bible documents" 
ON public.show_bible_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bible documents" 
ON public.show_bible_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_show_bible_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
CREATE TRIGGER update_show_bible_documents_updated_at
  BEFORE UPDATE ON public.show_bible_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_show_bible_documents_updated_at();
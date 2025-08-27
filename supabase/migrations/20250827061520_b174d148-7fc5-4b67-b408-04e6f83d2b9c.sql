-- Créer la table forms
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour forms
CREATE POLICY "Users can create their own forms" 
ON public.forms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own forms" 
ON public.forms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" 
ON public.forms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" 
ON public.forms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Créer la table publications (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  assigned_to TEXT,
  assigned_username TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  external_link TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour publications
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour publications
CREATE POLICY "Users can manage their own publications" 
ON public.publications 
FOR ALL 
USING (auth.uid() = user_id);
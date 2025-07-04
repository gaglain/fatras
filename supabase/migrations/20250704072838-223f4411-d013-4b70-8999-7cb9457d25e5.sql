
-- Ajouter la table des types d'événements
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour event_types
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour event_types
CREATE POLICY "Users can manage own event types" 
ON public.event_types 
FOR ALL 
USING (auth.uid() = user_id);

-- Ajouter les nouveaux champs à la table contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES public.event_types(id),
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS accepts_marketing_emails BOOLEAN DEFAULT true;

-- Supprimer la colonne company si elle existe (remplacée par event_id)
ALTER TABLE public.contacts DROP COLUMN IF EXISTS company;

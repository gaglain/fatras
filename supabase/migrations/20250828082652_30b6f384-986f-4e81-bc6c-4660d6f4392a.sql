-- Créer une table pour les relations entre contacts et événements
CREATE TABLE public.contact_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.centralized_events(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contact_id, event_id)
);

-- Ajouter RLS à la table contact_events
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres relations contact-événement
CREATE POLICY "Users can manage own contact events" 
ON public.contact_events 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = contact_events.contact_id 
    AND contacts.user_id = auth.uid()
  )
);

-- Ajouter une fonction pour obtenir les contacts liés à un événement
CREATE OR REPLACE FUNCTION get_event_contacts(event_id_param uuid)
RETURNS TABLE(
  contact_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.company,
    c.role
  FROM contacts c
  INNER JOIN contact_events ce ON c.id = ce.contact_id
  WHERE ce.event_id = event_id_param
  AND c.user_id = auth.uid();
$$;

-- Ajouter des colonnes pour la signature email dans user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email_signature text,
ADD COLUMN IF NOT EXISTS email_tracking_enabled boolean DEFAULT true;
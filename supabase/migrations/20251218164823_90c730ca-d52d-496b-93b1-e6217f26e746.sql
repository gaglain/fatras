-- Ajouter le champ booking_url à la table events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS booking_url text;
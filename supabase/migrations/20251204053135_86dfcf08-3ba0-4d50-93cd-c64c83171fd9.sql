-- Add touring availability field to centralized_artists
ALTER TABLE public.centralized_artists
ADD COLUMN is_touring boolean DEFAULT false;
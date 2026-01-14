-- Ajouter un numéro SACEM aux setlists (artist_songs)
ALTER TABLE public.artist_songs
ADD COLUMN IF NOT EXISTS sacem_number TEXT;
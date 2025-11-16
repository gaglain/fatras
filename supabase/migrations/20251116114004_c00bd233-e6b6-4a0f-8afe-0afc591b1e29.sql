-- Nettoyer les anciennes publications avec des blob: URLs non persistantes
-- Met à NULL les media_url qui commencent par 'blob:' car elles ne fonctionnent plus
UPDATE public.publications
SET media_url = NULL
WHERE media_url LIKE 'blob:%';

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.publications.media_url IS 'URL persistante du média (image ou vidéo) depuis Supabase Storage. Ne doit jamais contenir de blob: URLs.';
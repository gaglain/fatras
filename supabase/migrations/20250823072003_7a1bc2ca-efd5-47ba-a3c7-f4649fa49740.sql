-- Ajouter un champ artists à la table show_bible_documents
ALTER TABLE public.show_bible_documents 
ADD COLUMN artists text[] DEFAULT '{}';

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.show_bible_documents.artists IS 'Liste des IDs d''artistes associés à ce document';
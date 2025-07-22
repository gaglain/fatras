-- Ajouter la colonne company à la table contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS company TEXT;

-- Mettre à jour les métadonnées de la colonne pour la documentation
COMMENT ON COLUMN public.contacts.company IS 'Nom de l''entreprise ou organisation du contact';
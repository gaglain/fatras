-- Ajouter la colonne attachments à la table email_templates
ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
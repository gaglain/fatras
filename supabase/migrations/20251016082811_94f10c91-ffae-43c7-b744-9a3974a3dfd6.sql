-- Fonction pour mettre à jour le contact_id des emails en fonction de l'adresse email
CREATE OR REPLACE FUNCTION update_email_contact_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mettre à jour les emails reçus : lier par from_email
  UPDATE emails e
  SET contact_id = c.id
  FROM contacts c
  WHERE e.user_id = c.user_id
    AND e.direction = 'received'
    AND e.from_email = c.email
    AND e.contact_id IS NULL;

  -- Mettre à jour les emails envoyés : lier par to_email
  UPDATE emails e
  SET contact_id = c.id
  FROM contacts c
  WHERE e.user_id = c.user_id
    AND e.direction = 'sent'
    AND e.to_email = c.email
    AND e.contact_id IS NULL;
END;
$$;

-- Exécuter la fonction pour lier tous les emails existants
SELECT update_email_contact_links();

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_to_email ON emails(to_email);
CREATE INDEX IF NOT EXISTS idx_emails_user_id_direction ON emails(user_id, direction);
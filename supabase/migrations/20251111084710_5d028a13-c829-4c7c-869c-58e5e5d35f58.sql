-- Ajouter un champ pour marquer les comptes email comme partagés au niveau organisation
ALTER TABLE email_accounts 
ADD COLUMN IF NOT EXISTS is_organization_shared boolean DEFAULT false;

-- Marquer les comptes existants comme partagés (booking@fatras.net et fatrasplanning@gmail.com)
UPDATE email_accounts 
SET is_organization_shared = true 
WHERE email IN ('booking@fatras.net', 'fatrasplanning@gmail.com');

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_accounts_shared ON email_accounts(is_organization_shared) WHERE is_organization_shared = true;
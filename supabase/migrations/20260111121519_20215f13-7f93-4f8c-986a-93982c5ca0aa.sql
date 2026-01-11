-- D'abord supprimer les notifications liées aux emails en doublon
DELETE FROM email_notifications en
WHERE en.email_id IN (
  SELECT a.id
  FROM emails a
  INNER JOIN emails b ON a.message_id = b.message_id 
    AND a.user_id = b.user_id
    AND a.message_id IS NOT NULL
    AND a.created_at > b.created_at
);

-- Supprimer les doublons existants (garder le plus ancien)
DELETE FROM emails a
USING emails b
WHERE a.message_id = b.message_id 
  AND a.user_id = b.user_id
  AND a.message_id IS NOT NULL
  AND a.created_at > b.created_at;

-- Créer un index unique sur message_id + user_id pour éviter les futurs doublons
CREATE UNIQUE INDEX IF NOT EXISTS emails_message_id_user_id_unique 
ON emails(message_id, user_id) 
WHERE message_id IS NOT NULL;
-- Supprimer les doublons éventuels avant d'ajouter la contrainte unique
DELETE FROM website_designs a
USING website_designs b
WHERE a.created_at < b.created_at AND a.user_id = b.user_id;

-- Ajouter la contrainte unique sur user_id
ALTER TABLE website_designs ADD CONSTRAINT website_designs_user_id_unique UNIQUE (user_id);
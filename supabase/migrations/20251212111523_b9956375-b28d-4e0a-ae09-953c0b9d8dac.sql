-- Supprimer les canaux DM invalides (créés avec null comme second utilisateur)
DELETE FROM messaging_channels 
WHERE type = 'direct' 
AND name LIKE '%null%';

-- Supprimer les canaux DM qui n'ont qu'un seul membre (invalides)
DELETE FROM messaging_channels 
WHERE type = 'direct' 
AND id IN (
  SELECT c.id 
  FROM messaging_channels c 
  LEFT JOIN messaging_channel_members cm ON c.id = cm.channel_id 
  WHERE c.type = 'direct' 
  GROUP BY c.id 
  HAVING COUNT(cm.id) < 2
);
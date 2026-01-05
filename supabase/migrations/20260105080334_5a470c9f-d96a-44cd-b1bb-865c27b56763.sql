-- Add missing lineup members to their roadshow messaging channels
-- This will sync all existing roadshow stops' artist_lineup with their channel members

INSERT INTO messaging_channel_members (channel_id, user_id, role)
SELECT DISTINCT
  mc.id as channel_id,
  (lineup.value->>'userId')::uuid as user_id,
  'member' as role
FROM roadshow_stops rs
CROSS JOIN LATERAL jsonb_array_elements(rs.artist_lineup) as lineup
JOIN messaging_channels mc ON mc.roadshow_id = rs.id
WHERE (lineup.value->>'userId') IS NOT NULL
  AND (lineup.value->>'userId') != ''
  AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = (lineup.value->>'userId')::uuid
  )
  AND NOT EXISTS (
    SELECT 1 FROM messaging_channel_members mcm 
    WHERE mcm.channel_id = mc.id 
    AND mcm.user_id = (lineup.value->>'userId')::uuid
  )
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Also send notifications to newly synced members
INSERT INTO notifications (user_id, type, title, message, read, data)
SELECT DISTINCT
  (lineup.value->>'userId')::uuid as user_id,
  'roadshow_assignment' as type,
  'Assignation à une feuille de route' as title,
  'Vous avez été ajouté à la feuille de route "' || rs.city || ' - ' || rs.venue || '". Veuillez confirmer votre disponibilité.' as message,
  false as read,
  jsonb_build_object(
    'roadshow_stop_id', rs.id,
    'channel_id', mc.id,
    'action', 'confirm_availability'
  ) as data
FROM roadshow_stops rs
CROSS JOIN LATERAL jsonb_array_elements(rs.artist_lineup) as lineup
JOIN messaging_channels mc ON mc.roadshow_id = rs.id
WHERE (lineup.value->>'userId') IS NOT NULL
  AND (lineup.value->>'userId') != ''
  AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = (lineup.value->>'userId')::uuid
  );
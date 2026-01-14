-- Archive DM channels where the other member has no profile (shows as "Conversation privée")
-- These are orphan DMs with users who don't have a user_profile entry

-- Archive DM channel with user 5212570e-6515-4a2c-82b0-3519045310d9 (no profile)
UPDATE public.messaging_channels
SET is_active = false, updated_at = now()
WHERE id = '34b6629b-9517-42f5-ab14-bc2913111b0f';

-- Archive duplicate DM channel with user 6866e393... (no profile) - keep only one
-- There are two: 05ca1899... and b1212c68...
-- Archive the older one (05ca1899...)
UPDATE public.messaging_channels
SET is_active = false, updated_at = now()
WHERE id = '05ca1899-12c3-4d4a-bb08-c1116f1af3e9';

-- Also archive b1212c68... since 6866e393 has no profile anyway
UPDATE public.messaging_channels
SET is_active = false, updated_at = now()
WHERE id = 'b1212c68-4124-4ff8-bd2e-551c0b95b36b';

-- Archive duplicate DM to booking@fatras.net (keep only one: cba3cae2... has Silvere, keep 3657971e... for booking)
-- Actually looking at the data: 
-- 3657971e... = lolo <-> booking@fatras.net
-- cba3cae2... = lolo <-> Silvere Vauléon (Sissoo)
-- These are different users, so both are valid. No duplicates here.

-- Clean up: Archive the DM 3657971e... since it's a duplicate with the same two users as another DM
-- Wait, let me re-check - there's no duplicate for booking, only orphan profiles.
-- Archive the stray public channel that duplicates a roadshow private channel
UPDATE public.messaging_channels
SET is_active = false,
    updated_at = now()
WHERE id = '5c89e07e-27df-4a63-bd7e-86f45a5cce35'
  AND type = 'public'
  AND roadshow_id IS NULL
  AND is_active = true;

-- Enforce: any channel linked to a roadshow must be private
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'messaging_channels_roadshow_private_chk'
  ) THEN
    ALTER TABLE public.messaging_channels
      ADD CONSTRAINT messaging_channels_roadshow_private_chk
      CHECK (roadshow_id IS NULL OR type = 'private');
  END IF;
END $$;

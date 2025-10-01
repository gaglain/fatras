-- Deactivate duplicate active public channels with the same name (keep oldest)
WITH ranked AS (
  SELECT id,
         lower(name) AS lname,
         type,
         is_active,
         created_at,
         ROW_NUMBER() OVER (PARTITION BY lower(name), type ORDER BY created_at ASC) AS rn
  FROM public.messaging_channels
  WHERE type = 'public' AND is_active = true
)
UPDATE public.messaging_channels AS mc
SET is_active = false
FROM ranked r
WHERE mc.id = r.id AND r.rn > 1;

-- Improve realtime change payloads (esp. for updates/deletes)
ALTER TABLE public.messaging_messages REPLICA IDENTITY FULL;
ALTER TABLE public.messaging_channels REPLICA IDENTITY FULL;
ALTER TABLE public.messaging_channel_members REPLICA IDENTITY FULL;

-- Prevent future duplicates of active public channel names (Slack-like uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS messaging_channels_unique_public_name_active
  ON public.messaging_channels (lower(name))
  WHERE type = 'public' AND is_active = true;
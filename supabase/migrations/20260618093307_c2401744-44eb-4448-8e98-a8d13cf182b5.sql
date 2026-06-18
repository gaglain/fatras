ALTER TABLE public.contact_lists ADD COLUMN IF NOT EXISTS is_exclusion BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.campaign_contact_lists ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'include';
ALTER TABLE public.campaign_contact_lists DROP CONSTRAINT IF EXISTS campaign_contact_lists_campaign_id_contact_list_id_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campaign_contact_lists_kind_check'
  ) THEN
    ALTER TABLE public.campaign_contact_lists
      ADD CONSTRAINT campaign_contact_lists_kind_check CHECK (kind IN ('include','exclude'));
  END IF;
END$$;
CREATE UNIQUE INDEX IF NOT EXISTS campaign_contact_lists_campaign_list_kind_uidx
  ON public.campaign_contact_lists (campaign_id, contact_list_id, kind);
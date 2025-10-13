-- Deduplicate existing app_settings rows before adding unique constraint
DELETE FROM public.app_settings a
USING public.app_settings b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.setting_key = b.setting_key;

-- Add a unique constraint for upsert support
ALTER TABLE public.app_settings
ADD CONSTRAINT app_settings_user_setting_key_uniq UNIQUE (user_id, setting_key);

-- Helpful index for queries by user
CREATE INDEX IF NOT EXISTS idx_app_settings_user ON public.app_settings (user_id);

ALTER TABLE public.roadshow_stops
  ADD COLUMN IF NOT EXISTS technical_contact_name text,
  ADD COLUMN IF NOT EXISTS technical_contact_email text,
  ADD COLUMN IF NOT EXISTS technical_contact_phone text;
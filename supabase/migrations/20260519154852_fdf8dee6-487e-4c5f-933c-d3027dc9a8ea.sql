ALTER TABLE public.roadshow_stops
  ADD COLUMN IF NOT EXISTS has_dressing_room boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dressing_room_address text;
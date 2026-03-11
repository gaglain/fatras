ALTER TABLE public.roadshow_stops 
  ADD COLUMN IF NOT EXISTS meeting_point_time text,
  ADD COLUMN IF NOT EXISTS meeting_point_location text,
  ADD COLUMN IF NOT EXISTS departure_to_show_time text;
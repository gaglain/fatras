-- Add waypoints column to roadshow_stops for storing intermediate route stops
ALTER TABLE public.roadshow_stops 
ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]'::jsonb;
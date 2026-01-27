-- Add geolocation fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_events_coordinates 
ON public.events (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.events.latitude IS 'GPS latitude of event venue';
COMMENT ON COLUMN public.events.longitude IS 'GPS longitude of event venue';
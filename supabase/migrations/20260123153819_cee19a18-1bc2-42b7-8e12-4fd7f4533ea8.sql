-- Add google_calendar_event_id column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_google_calendar_event_id 
ON public.events(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;
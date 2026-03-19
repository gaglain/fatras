
-- Add Nylas sync columns to events table
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS nylas_event_id text,
  ADD COLUMN IF NOT EXISTS nylas_grant_id text,
  ADD COLUMN IF NOT EXISTS route_sheet_id uuid REFERENCES public.roadshow_stops(id) ON DELETE SET NULL;

-- Index for quick lookup by nylas_event_id
CREATE INDEX IF NOT EXISTS idx_events_nylas_event_id ON public.events(nylas_event_id) WHERE nylas_event_id IS NOT NULL;

-- Add artist_id to events to link events to shows (centralized_artists)
-- Safe migration: new nullable column with FK and index
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS artist_id uuid NULL;

-- Add foreign key to centralized_artists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_artist_id_fkey'
  ) THEN
    ALTER TABLE public.events
    ADD CONSTRAINT events_artist_id_fkey
    FOREIGN KEY (artist_id)
    REFERENCES public.centralized_artists(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Index for faster filtering by artist
CREATE INDEX IF NOT EXISTS idx_events_artist_id ON public.events(artist_id);

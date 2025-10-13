-- Link tasks and quotes to spectacles (centralized_artists)
-- 1) Ensure tasks.artist_id references centralized_artists(id)
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_artist_id_fkey;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_artist_id_fkey
  FOREIGN KEY (artist_id) REFERENCES public.centralized_artists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_artist_id ON public.tasks(artist_id);

-- 2) Add artist_id to quotes and reference centralized_artists
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS artist_id uuid;

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_artist_id_fkey;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_artist_id_fkey
  FOREIGN KEY (artist_id) REFERENCES public.centralized_artists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_artist_id ON public.quotes(artist_id);

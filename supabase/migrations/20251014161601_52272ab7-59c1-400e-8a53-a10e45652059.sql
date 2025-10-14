-- Create link table for contacts and spectacles (artists)
CREATE TABLE IF NOT EXISTS public.contact_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  role TEXT DEFAULT 'related',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes and constraints
CREATE UNIQUE INDEX IF NOT EXISTS contact_artists_unique ON public.contact_artists(contact_id, artist_id);
CREATE INDEX IF NOT EXISTS idx_contact_artists_contact ON public.contact_artists(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_artists_artist ON public.contact_artists(artist_id);

-- Enable RLS
ALTER TABLE public.contact_artists ENABLE ROW LEVEL SECURITY;

-- Recreate policy safely
DROP POLICY IF EXISTS "Users can manage own contact artists" ON public.contact_artists;
CREATE POLICY "Users can manage own contact artists"
ON public.contact_artists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contacts c
    WHERE c.id = contact_artists.contact_id AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contacts c
    WHERE c.id = contact_artists.contact_id AND c.user_id = auth.uid()
  )
);

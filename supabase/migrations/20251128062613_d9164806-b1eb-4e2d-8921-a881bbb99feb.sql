-- Create show_bible_setlists table
CREATE TABLE IF NOT EXISTS public.show_bible_setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_id UUID REFERENCES public.centralized_artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create show_bible_setlist_songs table
CREATE TABLE IF NOT EXISTS public.show_bible_setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID NOT NULL REFERENCES public.show_bible_setlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_bible_setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_bible_setlist_songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for setlists
CREATE POLICY "Users can view all setlists"
  ON public.show_bible_setlists FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create setlists"
  ON public.show_bible_setlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setlists"
  ON public.show_bible_setlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own setlists"
  ON public.show_bible_setlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for songs
CREATE POLICY "Users can view all setlist songs"
  ON public.show_bible_setlist_songs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create setlist songs"
  ON public.show_bible_setlist_songs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.show_bible_setlists
    WHERE id = setlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own setlist songs"
  ON public.show_bible_setlist_songs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.show_bible_setlists
    WHERE id = setlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own setlist songs"
  ON public.show_bible_setlist_songs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.show_bible_setlists
    WHERE id = setlist_id AND user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_show_bible_setlists_updated_at
  BEFORE UPDATE ON public.show_bible_setlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_show_bible_setlist_songs_updated_at
  BEFORE UPDATE ON public.show_bible_setlist_songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_show_bible_setlists_artist_id ON public.show_bible_setlists(artist_id);
CREATE INDEX IF NOT EXISTS idx_show_bible_setlists_user_id ON public.show_bible_setlists(user_id);
CREATE INDEX IF NOT EXISTS idx_show_bible_setlist_songs_setlist_id ON public.show_bible_setlist_songs(setlist_id);
CREATE INDEX IF NOT EXISTS idx_show_bible_setlist_songs_position ON public.show_bible_setlist_songs(setlist_id, position);
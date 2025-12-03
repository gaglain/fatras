-- Create song library table for reusable songs per artist
CREATE TABLE public.artist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_id UUID REFERENCES public.centralized_artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  notes TEXT,
  tonality TEXT,
  bpm INTEGER,
  lyrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new fields to setlist songs
ALTER TABLE public.show_bible_setlist_songs 
ADD COLUMN IF NOT EXISTS tonality TEXT,
ADD COLUMN IF NOT EXISTS bpm INTEGER,
ADD COLUMN IF NOT EXISTS lyrics TEXT,
ADD COLUMN IF NOT EXISTS library_song_id UUID REFERENCES public.artist_songs(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.artist_songs ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist_songs
CREATE POLICY "Users can view all artist songs" 
ON public.artist_songs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create artist songs" 
ON public.artist_songs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artist songs" 
ON public.artist_songs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own artist songs" 
ON public.artist_songs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_artist_songs_updated_at
BEFORE UPDATE ON public.artist_songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
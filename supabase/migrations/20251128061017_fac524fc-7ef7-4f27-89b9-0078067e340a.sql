-- Create show_bible_notes table for collaborative notes
CREATE TABLE IF NOT EXISTS public.show_bible_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_id UUID REFERENCES public.centralized_artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'markdown',
  mentioned_users UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_bible_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all show bible notes"
  ON public.show_bible_notes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create show bible notes"
  ON public.show_bible_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own show bible notes"
  ON public.show_bible_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own show bible notes"
  ON public.show_bible_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_show_bible_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_show_bible_notes_updated_at
  BEFORE UPDATE ON public.show_bible_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_show_bible_notes_updated_at();

-- Create notifications for mentioned users
CREATE OR REPLACE FUNCTION notify_mentioned_users()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id UUID;
  author_name TEXT;
BEGIN
  -- Get author name
  SELECT COALESCE(first_name || ' ' || last_name, username, email)
  INTO author_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  -- Create notification for each mentioned user
  IF NEW.mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          message,
          is_read,
          priority,
          metadata
        ) VALUES (
          mentioned_user_id,
          'mention',
          'Mention dans une note',
          author_name || ' vous a mentionné dans "' || NEW.title || '"',
          false,
          'normal',
          jsonb_build_object(
            'note_id', NEW.id,
            'author_id', NEW.user_id,
            'artist_id', NEW.artist_id
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_mentioned_users_trigger
  AFTER INSERT OR UPDATE ON public.show_bible_notes
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentioned_users();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_show_bible_notes_artist_id ON public.show_bible_notes(artist_id);
CREATE INDEX IF NOT EXISTS idx_show_bible_notes_user_id ON public.show_bible_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_show_bible_notes_mentioned_users ON public.show_bible_notes USING GIN(mentioned_users);
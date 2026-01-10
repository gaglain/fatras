-- Fix the notify_mentioned_users trigger function to use correct column names
-- The notifications table has: id, user_id, type, title, message, data (not metadata), read (not is_read)
-- No priority column exists

CREATE OR REPLACE FUNCTION public.notify_mentioned_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id UUID;
  author_name TEXT;
BEGIN
  -- Get author name
  SELECT COALESCE(first_name || ' ' || last_name, username, email)
  INTO author_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  -- Notify mentioned users
  IF NEW.mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          message,
          read,
          data
        ) VALUES (
          mentioned_user_id,
          'mention',
          'Mention dans une note',
          author_name || ' vous a mentionné dans "' || NEW.title || '"',
          false,
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
$$;
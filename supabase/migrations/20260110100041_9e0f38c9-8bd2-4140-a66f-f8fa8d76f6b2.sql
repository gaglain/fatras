-- Fix the trigger function to use correct column names
-- The notifications table has: id, user_id, type, title, message, data (not metadata), read (not is_read)
-- No priority column exists

CREATE OR REPLACE FUNCTION public.notify_channel_members_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  channel_name TEXT;
  sender_name TEXT;
BEGIN
  -- Get channel name
  SELECT name INTO channel_name
  FROM public.messaging_channels
  WHERE id = NEW.channel_id;

  -- Get sender name
  SELECT COALESCE(first_name || ' ' || last_name, username, 'Utilisateur')
  INTO sender_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  -- Notify all other members
  FOR member_record IN
    SELECT user_id
    FROM public.messaging_channel_members
    WHERE channel_id = NEW.channel_id
    AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read,
      data
    ) VALUES (
      member_record.user_id,
      'message',
      'Nouveau message dans ' || COALESCE(channel_name, 'un canal'),
      sender_name || ' : ' || LEFT(NEW.content, 100),
      false,
      jsonb_build_object(
        'channel_id', NEW.channel_id,
        'message_id', NEW.id,
        'channel_name', channel_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;
-- Créer une fonction trigger pour les notifications de messages
CREATE OR REPLACE FUNCTION public.notify_channel_members_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
  channel_name TEXT;
  sender_name TEXT;
BEGIN
  -- Récupérer le nom du canal
  SELECT name INTO channel_name
  FROM public.messaging_channels
  WHERE id = NEW.channel_id;

  -- Récupérer le nom de l'expéditeur
  SELECT COALESCE(first_name || ' ' || last_name, username, 'Utilisateur')
  INTO sender_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  -- Créer une notification pour chaque membre du canal (sauf l'expéditeur)
  FOR member_record IN
    SELECT user_id
    FROM public.messaging_channel_members
    WHERE channel_id = NEW.channel_id
    AND user_id != NEW.user_id
  LOOP
    -- Insérer une notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      priority,
      metadata
    ) VALUES (
      member_record.user_id,
      'message',
      'Nouveau message',
      sender_name || ' : ' || LEFT(NEW.content, 100),
      false,
      'normal',
      jsonb_build_object(
        'channel_id', NEW.channel_id,
        'message_id', NEW.id,
        'channel_name', channel_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table messaging_messages
DROP TRIGGER IF EXISTS trigger_notify_channel_members ON public.messaging_messages;
CREATE TRIGGER trigger_notify_channel_members
  AFTER INSERT ON public.messaging_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_channel_members_on_new_message();
-- Create a trigger function to automatically create notifications when a visitor sends a public chat message
CREATE OR REPLACE FUNCTION public.notify_on_public_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user RECORD;
BEGIN
  -- Only create notifications for visitor messages (not admin messages)
  IF NEW.is_from_admin = false THEN
    -- Create a notification for all admin/super_admin users
    FOR admin_user IN 
      SELECT user_id FROM public.user_profiles 
      WHERE role IN ('admin', 'super_admin') 
      AND is_active = true 
      AND user_id IS NOT NULL
    LOOP
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        read,
        data
      ) VALUES (
        admin_user.user_id,
        'public_chat',
        'Nouveau message du site',
        COALESCE(NEW.visitor_name, 'Un visiteur') || ': ' || LEFT(NEW.message, 50) || CASE WHEN LENGTH(NEW.message) > 50 THEN '...' ELSE '' END,
        false,
        jsonb_build_object('visitor_id', NEW.visitor_id, 'message_id', NEW.id)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_on_public_chat_message ON public.public_chat_messages;
CREATE TRIGGER trigger_notify_on_public_chat_message
  AFTER INSERT ON public.public_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_public_chat_message();
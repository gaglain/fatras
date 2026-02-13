
-- Trigger pour créer des notifications email quand un email reçu est inséré dans la table emails
CREATE TRIGGER on_new_email_notification
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.create_email_notification();

-- Trigger pour créer des notifications dans la table unifiée 'notifications' aussi
CREATE OR REPLACE FUNCTION public.create_unified_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.direction = 'received' THEN
    INSERT INTO public.notifications (user_id, type, title, message, read, data)
    VALUES (
      NEW.user_id,
      'new_email',
      'Nouveau email reçu',
      'De: ' || COALESCE(NEW.from_name, NEW.from_email) || ' - ' || COALESCE(NEW.subject, '(Aucun sujet)'),
      false,
      jsonb_build_object(
        'from_email', NEW.from_email,
        'from_name', NEW.from_name,
        'subject', NEW.subject,
        'email_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_email_unified_notification
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.create_unified_email_notification();

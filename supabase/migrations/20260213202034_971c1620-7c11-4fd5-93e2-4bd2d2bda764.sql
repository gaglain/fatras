-- Supprimer le trigger redondant qui écrit dans email_notifications
DROP TRIGGER IF EXISTS on_new_email_notification ON public.emails;

-- Mettre à jour le trigger unifié pour ne notifier que booking@fatras.net
CREATE OR REPLACE FUNCTION public.create_unified_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.direction = 'received' THEN
    -- Ne notifier que pour les emails reçus sur booking@fatras.net
    IF NEW.to_email IS NOT NULL AND lower(NEW.to_email) = 'booking@fatras.net' THEN
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
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Nettoyer les notifications en double créées récemment
DELETE FROM public.notifications 
WHERE type = 'new_email' 
AND created_at > now() - interval '2 hours';
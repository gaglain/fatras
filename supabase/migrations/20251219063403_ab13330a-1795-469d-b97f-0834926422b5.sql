-- Fix email notifications default unread + ensure trigger inserts unread
ALTER TABLE public.email_notifications
  ALTER COLUMN is_read SET DEFAULT false;

-- Mark recent email notifications as unread (so you see yesterday's too)
UPDATE public.email_notifications
SET is_read = false
WHERE type = 'new_email'
  AND is_read = true
  AND created_at IS NOT NULL
  AND created_at >= now() - interval '2 days';

-- Ensure trigger sets is_read=false explicitly
CREATE OR REPLACE FUNCTION public.create_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Create notification for new received emails
  IF NEW.direction = 'received' AND OLD IS NULL THEN
    INSERT INTO public.email_notifications (user_id, email_id, type, title, message, is_read)
    VALUES (
      NEW.user_id,
      NEW.id,
      'new_email',
      'Nouveau email reçu',
      'De: ' || COALESCE(NEW.from_name, NEW.from_email) || ' - ' || COALESCE(NEW.subject, '(Aucun sujet)'),
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Enable realtime for instant in-app notifications
ALTER TABLE public.email_notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'email_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_notifications;
  END IF;
END $$;

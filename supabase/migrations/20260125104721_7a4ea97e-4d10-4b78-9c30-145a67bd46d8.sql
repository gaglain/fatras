-- 1) Fix IMAP/Nylas upserts: inbound_emails must be unique per (message_id, user_id)
ALTER TABLE public.inbound_emails DROP CONSTRAINT IF EXISTS inbound_emails_message_id_key;
DROP INDEX IF EXISTS public.inbound_emails_message_id_key;

-- Match Edge Function ON CONFLICT (message_id,user_id)
CREATE UNIQUE INDEX IF NOT EXISTS inbound_emails_message_id_user_id_unique
  ON public.inbound_emails (message_id, user_id)
  WHERE message_id IS NOT NULL;

-- 2) Make email_notifications reliable + deduped
UPDATE public.email_notifications
SET is_read = false
WHERE is_read IS NULL;

ALTER TABLE public.email_notifications
  ALTER COLUMN is_read SET DEFAULT false,
  ALTER COLUMN is_read SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS email_notifications_dedup_idx
  ON public.email_notifications (user_id, email_id, type);

-- Ensure Realtime works (idempotent)
ALTER TABLE public.email_notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='email_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.email_notifications;
  END IF;
END $$;

-- 3) Server-side notifications when new received emails are inserted into public.emails
CREATE OR REPLACE FUNCTION public.create_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.direction = 'received' THEN
    INSERT INTO public.email_notifications (user_id, email_id, type, title, message, is_read)
    VALUES (
      NEW.user_id,
      NEW.id,
      'new_email',
      'Nouveau email reçu',
      'De: ' || COALESCE(NEW.from_name, NEW.from_email) || ' - ' || COALESCE(NEW.subject, '(Aucun sujet)'),
      false
    )
    ON CONFLICT (user_id, email_id, type) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_email_notification ON public.emails;
CREATE TRIGGER trg_create_email_notification
AFTER INSERT ON public.emails
FOR EACH ROW
EXECUTE FUNCTION public.create_email_notification();

-- 4) Enable pg_net and pg_cron extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
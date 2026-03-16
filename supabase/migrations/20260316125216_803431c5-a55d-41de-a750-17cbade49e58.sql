-- Drop silent badge sync triggers (iOS doesn't support silent push)
DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_notification_update ON public.notifications;
DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_email_notification_insert ON public.email_notifications;
DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_email_notification_update ON public.email_notifications;

-- Create a proper visible push trigger for email_notifications (like the one for notifications)
CREATE OR REPLACE FUNCTION public.dispatch_push_on_email_notification_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  unread_general_count integer := 0;
  unread_email_count integer := 0;
  unread_count integer := 0;
  request_headers jsonb;
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q';
  service_role_key text;
BEGIN
  SELECT COUNT(*)::int INTO unread_general_count
  FROM public.notifications
  WHERE user_id = NEW.user_id AND COALESCE(read, false) = false;

  SELECT COUNT(*)::int INTO unread_email_count
  FROM public.email_notifications
  WHERE user_id = NEW.user_id AND COALESCE(is_read, false) = false;

  unread_count := COALESCE(unread_general_count, 0) + COALESCE(unread_email_count, 0);

  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    service_role_key := NULL;
  END;

  request_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || COALESCE(service_role_key, supabase_anon_key),
    'x-trigger-secret', 'internal-push-trigger'
  );

  PERFORM net.http_post(
    url := 'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/send-push-notification',
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'notification', jsonb_build_object(
        'title', NEW.title,
        'body', COALESCE(NEW.message, ''),
        'tag', 'email-notification-' || NEW.id::text,
        'data', jsonb_build_object('type', NEW.type, 'email_id', NEW.email_id, 'badgeCount', unread_count)
      )
    )::text,
    params := '{}'::jsonb,
    headers := request_headers,
    timeout_milliseconds := 15000
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_push_on_email_notification_insert
  AFTER INSERT ON public.email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION dispatch_push_on_email_notification_insert();
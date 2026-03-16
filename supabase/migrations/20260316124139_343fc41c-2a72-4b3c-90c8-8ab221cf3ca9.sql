-- Ensure visible push dispatch exists on notification inserts and badge sync works in background on read-state changes.

CREATE OR REPLACE FUNCTION public.dispatch_push_notification_on_notification_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  unread_general_count integer := 0;
  unread_email_count integer := 0;
  unread_count integer := 0;
  notification_data jsonb := '{}'::jsonb;
  request_headers jsonb;
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q';
  service_role_key text;
BEGIN
  IF NOT (
    NEW.type IN ('message', 'new_email', 'roadshow_assignment', 'public_chat', 'mention')
    OR NEW.type LIKE 'task_%'
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.data IS NOT NULL AND jsonb_typeof(NEW.data) = 'object' THEN
    notification_data := NEW.data;
  END IF;

  SELECT COUNT(*)::int INTO unread_general_count
  FROM public.notifications
  WHERE user_id = NEW.user_id
    AND COALESCE(read, false) = false;

  SELECT COUNT(*)::int INTO unread_email_count
  FROM public.email_notifications
  WHERE user_id = NEW.user_id
    AND COALESCE(is_read, false) = false;

  unread_count := COALESCE(unread_general_count, 0) + COALESCE(unread_email_count, 0);

  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
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
        'tag', 'notification-' || NEW.id::text,
        'data', notification_data || jsonb_build_object('type', NEW.type, 'badgeCount', unread_count)
      )
    )::text,
    params := '{}'::jsonb,
    headers := request_headers,
    timeout_milliseconds := 15000
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.dispatch_push_badge_sync_on_notification_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  unread_general_count integer := 0;
  unread_email_count integer := 0;
  unread_count integer := 0;
  request_headers jsonb;
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFub24iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q';
  service_role_key text;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  IF target_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_TABLE_NAME = 'notifications'
     AND TG_OP = 'UPDATE'
     AND COALESCE(NEW.read, false) IS NOT DISTINCT FROM COALESCE(OLD.read, false) THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'email_notifications'
     AND TG_OP = 'UPDATE'
     AND COALESCE(NEW.is_read, false) IS NOT DISTINCT FROM COALESCE(OLD.is_read, false) THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)::int INTO unread_general_count
  FROM public.notifications
  WHERE user_id = target_user_id
    AND COALESCE(read, false) = false;

  SELECT COUNT(*)::int INTO unread_email_count
  FROM public.email_notifications
  WHERE user_id = target_user_id
    AND COALESCE(is_read, false) = false;

  unread_count := COALESCE(unread_general_count, 0) + COALESCE(unread_email_count, 0);

  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
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
      'userId', target_user_id,
      'notification', jsonb_build_object(
        'data', jsonb_build_object(
          'silentBadgeSync', true,
          'badgeCount', unread_count
        )
      )
    )::text,
    params := '{}'::jsonb,
    headers := request_headers,
    timeout_milliseconds := 15000
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trigger_dispatch_push_notification_on_notification_insert ON public.notifications;
CREATE TRIGGER trigger_dispatch_push_notification_on_notification_insert
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_push_notification_on_notification_insert();

DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_notification_update ON public.notifications;
CREATE TRIGGER trigger_sync_push_badge_on_notification_update
AFTER UPDATE OF read ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_push_badge_sync_on_notification_change();

DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_email_notification_insert ON public.email_notifications;
CREATE TRIGGER trigger_sync_push_badge_on_email_notification_insert
AFTER INSERT ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_push_badge_sync_on_notification_change();

DROP TRIGGER IF EXISTS trigger_sync_push_badge_on_email_notification_update ON public.email_notifications;
CREATE TRIGGER trigger_sync_push_badge_on_email_notification_update
AFTER UPDATE OF is_read ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_push_badge_sync_on_notification_change();
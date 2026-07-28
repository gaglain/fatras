CREATE OR REPLACE FUNCTION public.dispatch_push_badge_sync_on_notification_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_user_id uuid;
  unread_general_count integer := 0;
  unread_email_count integer := 0;
  unread_count integer := 0;
  request_headers jsonb;
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q';
  service_role_key text;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  IF target_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Nested IFs: PL/pgSQL compiles the whole boolean expression, so NEW.is_read
  -- must never be referenced when the trigger runs on the notifications table.
  IF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'notifications' THEN
      IF COALESCE(NEW.read, false) IS NOT DISTINCT FROM COALESCE(OLD.read, false) THEN
        RETURN NEW;
      END IF;
    ELSIF TG_TABLE_NAME = 'email_notifications' THEN
      IF COALESCE(NEW.is_read, false) IS NOT DISTINCT FROM COALESCE(OLD.is_read, false) THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;

  SELECT COUNT(*)::int INTO unread_general_count
  FROM public.notifications
  WHERE user_id = target_user_id AND COALESCE(read, false) = false;

  SELECT COUNT(*)::int INTO unread_email_count
  FROM public.email_notifications
  WHERE user_id = target_user_id AND COALESCE(is_read, false) = false;

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

  BEGIN
    PERFORM net.http_post(
      url := 'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/send-push-notification',
      body := jsonb_build_object(
        'userId', target_user_id,
        'notification', jsonb_build_object(
          'title', 'Synchronisation badge',
          'body', 'Mise à jour du badge',
          'data', jsonb_build_object('silentBadgeSync', true, 'badgeCount', unread_count)
        )
      ),
      params := '{}'::jsonb,
      headers := request_headers,
      timeout_milliseconds := 15000
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN COALESCE(NEW, OLD);
END;
$function$;
CREATE OR REPLACE FUNCTION public.dispatch_push_notification_on_notification_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_role_key text;
  unread_count integer := 0;
  notification_data jsonb := '{}'::jsonb;
  request_headers jsonb;
BEGIN
  -- Push pour les types visibles côté utilisateur (inclut toutes les variantes task_*)
  IF NOT (
    NEW.type IN ('message', 'new_email', 'roadshow_assignment', 'public_chat', 'mention')
    OR NEW.type LIKE 'task_%'
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.data IS NOT NULL AND jsonb_typeof(NEW.data) = 'object' THEN
    notification_data := NEW.data;
  END IF;

  SELECT COUNT(*)::int INTO unread_count
  FROM public.notifications
  WHERE user_id = NEW.user_id
    AND COALESCE(read, false) = false;

  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE WARNING 'SUPABASE_SERVICE_ROLE_KEY missing; push skipped for notification % (type=%)', NEW.id, NEW.type;
    RETURN NEW;
  END IF;

  request_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || service_role_key
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
    ),
    params := '{}'::jsonb,
    headers := request_headers,
    timeout_milliseconds := 10000
  );

  RETURN NEW;
END;
$$;
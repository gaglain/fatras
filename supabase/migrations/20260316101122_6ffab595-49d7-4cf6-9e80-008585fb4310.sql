-- Drop and recreate the trigger function to use anon key instead of service role key from vault
-- Since verify_jwt is now false, we can use the anon key and add internal auth logic
CREATE OR REPLACE FUNCTION public.dispatch_push_notification_on_notification_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  unread_count integer := 0;
  notification_data jsonb := '{}'::jsonb;
  request_headers jsonb;
  supabase_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q';
  service_role_key text;
BEGIN
  -- Push pour les types visibles côté utilisateur
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

  -- Try vault first, fall back to none
  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    service_role_key := NULL;
  END;

  -- Use service role key if available, otherwise use anon key
  -- (edge function has verify_jwt=false so both will reach the function)
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
    ),
    params := '{}'::jsonb,
    headers := request_headers,
    timeout_milliseconds := 15000
  );

  RETURN NEW;
END;
$function$;

-- Trigger on notifications table to call edge function for mention emails
-- Uses pg_net extension for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send mention email via edge function
CREATE OR REPLACE FUNCTION public.notify_mention_by_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mention_email_enabled TEXT;
  user_email TEXT;
  supabase_url TEXT := 'https://nhoemjarkxqwruupqgyd.supabase.co';
  service_role_key TEXT;
BEGIN
  -- Only process mention-type notifications
  IF NEW.type NOT IN ('mention') THEN
    RETURN NEW;
  END IF;

  -- Check if user has email mentions enabled in app_settings
  SELECT setting_value INTO mention_email_enabled
  FROM public.app_settings
  WHERE user_id = NEW.user_id
    AND setting_key = 'notify_mentions_by_email'
  LIMIT 1;

  -- Default to disabled if no setting found
  IF mention_email_enabled IS NULL OR mention_email_enabled != 'true' THEN
    RETURN NEW;
  END IF;

  -- Get user email
  SELECT email INTO user_email
  FROM public.user_profiles
  WHERE user_id = NEW.user_id
  LIMIT 1;

  IF user_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get service role key from vault
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;

  -- Call edge function asynchronously via pg_net
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/send-mention-email',
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'user_email', user_email,
      'title', NEW.title,
      'message', NEW.message,
      'data', NEW.data
    )::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )::jsonb
  );

  RETURN NEW;
END;
$$;

-- Create trigger on notifications table
DROP TRIGGER IF EXISTS trigger_mention_email ON public.notifications;
CREATE TRIGGER trigger_mention_email
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_mention_by_email();

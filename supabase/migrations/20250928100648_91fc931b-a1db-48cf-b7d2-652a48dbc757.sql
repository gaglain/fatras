-- Create cron job for automatic sync (runs every 5 minutes)
-- First enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job for auto-sync scheduler
SELECT cron.schedule(
  'auto-sync-scheduler',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/auto-sync-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc4NDU3MiwiZXhwIjoyMDY0MzYwNTcyfQ.bc3q8V4VfN8FZ-u1bEzGd8KPvApx8gWtmdPhHSy50d0"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create function to send password reset emails
CREATE OR REPLACE FUNCTION public.send_password_reset_email(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Call Resend edge function to send password reset email
  SELECT content::jsonb INTO result
  FROM http((
    'POST',
    'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/send-email-resend',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODc4NDU3MiwiZXhwIjoyMDY0MzYwNTcyfQ.bc3q8V4VfN8FZ-u1bEzGd8KPvApx8gWtmdPhHSy50d0')
    ],
    'application/json',
    json_build_object(
      'to', user_email,
      'subject', 'Réinitialisation de votre mot de passe',
      'html', '<h1>Réinitialisation de mot de passe</h1><p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p><p><a href="' || current_setting('app.base_url', true) || '/auth/reset-password">Réinitialiser le mot de passe</a></p>',
      'type', 'password_reset'
    )::text
  ));

  RETURN COALESCE(result, '{"success": false, "error": "No response"}'::jsonb);
END;
$$;
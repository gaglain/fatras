-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the email auto-sync to run every 5 minutes
SELECT cron.schedule(
  'email-auto-sync-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/auto-email-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
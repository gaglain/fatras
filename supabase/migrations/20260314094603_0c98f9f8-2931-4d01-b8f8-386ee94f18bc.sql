
SELECT cron.schedule(
  'send-roadshow-reminders',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/send-roadshow-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijBidObMHhzUvUMqi8ej7MWAkbxS"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    ) AS request_id;
  $$
);

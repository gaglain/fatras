-- Activer pg_cron et pg_net si nécessaire
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprimer l'ancien job s'il existe
DO $$ BEGIN
  PERFORM cron.unschedule('send-scheduled-campaigns-hourly');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Planifier l'envoi des campagnes programmées toutes les heures
SELECT cron.schedule(
  'send-scheduled-campaigns-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/send-scheduled-campaigns',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ob2VtamFya3hxd3J1dXBxZ3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ1NzIsImV4cCI6MjA2NDM2MDU3Mn0.gc7_0DlXibJfAs8uijJz6kU2PwFoN0MPQNE2rTlBo0Q"}'::jsonb,
    body := jsonb_build_object('time', now())
  );
  $$
);

-- Reprogrammer immédiatement la campagne actuellement en cours d'étalement
UPDATE public.email_campaigns
SET scheduled_for = now() - interval '1 minute'
WHERE id = '1b03fbcf-1edb-4425-849e-f25e35f8c153'
  AND status = 'sending';
-- Store multiple web push subscriptions per user/device so desktop sessions no longer overwrite the mobile PWA subscription.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active
  ON public.push_subscriptions (user_id, is_active);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill the latest legacy single-subscription record stored in app_settings.
INSERT INTO public.push_subscriptions (
  user_id,
  endpoint,
  p256dh,
  auth_key,
  created_at,
  updated_at,
  last_seen_at,
  is_active
)
SELECT
  s.user_id,
  payload->>'endpoint' AS endpoint,
  payload#>>'{keys,p256dh}' AS p256dh,
  payload#>>'{keys,auth}' AS auth_key,
  COALESCE(s.created_at, now()),
  COALESCE(s.updated_at, now()),
  COALESCE(s.updated_at, now()),
  true
FROM (
  SELECT
    user_id,
    created_at,
    updated_at,
    setting_value::jsonb AS payload
  FROM public.app_settings
  WHERE setting_key = 'push_subscription'
    AND setting_value IS NOT NULL
    AND setting_value LIKE '{%'
) s
WHERE COALESCE(s.payload->>'endpoint', '') <> ''
  AND COALESCE(s.payload#>>'{keys,p256dh}', '') <> ''
  AND COALESCE(s.payload#>>'{keys,auth}', '') <> ''
ON CONFLICT (endpoint) DO NOTHING;

CREATE TABLE public.roadshow_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'j-15', 'j-7', 'j-1'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (roadshow_stop_id, user_id, reminder_type)
);

ALTER TABLE public.roadshow_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder logs"
  ON public.roadshow_reminder_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage reminder logs"
  ON public.roadshow_reminder_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

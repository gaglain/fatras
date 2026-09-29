CREATE TABLE public.email_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid,
  original_email_id uuid,
  to_email text NOT NULL,
  from_email text,
  subject text NOT NULL,
  html_content text NOT NULL,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_followups TO authenticated;
GRANT ALL ON public.email_followups TO service_role;
ALTER TABLE public.email_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own followups" ON public.email_followups FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX email_followups_pending_idx ON public.email_followups (status, send_at);
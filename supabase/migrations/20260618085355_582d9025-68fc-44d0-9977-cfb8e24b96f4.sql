
-- 1. SEQUENCES
CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active', -- active | archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_sequences TO authenticated;
GRANT ALL ON public.email_sequences TO service_role;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view sequences" ON public.email_sequences FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert sequences" ON public.email_sequences FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Authenticated can update sequences" ON public.email_sequences FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete sequences" ON public.email_sequences FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_email_sequences_updated_at BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. STEPS
CREATE TABLE public.email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  position integer NOT NULL,
  name text NOT NULL,
  delay_label text, -- e.g. "J+7", informational only
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  source_list_ids uuid[] NOT NULL DEFAULT '{}',
  excluded_list_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft', -- draft | ready | sending | sent | segmented
  sent_at timestamptz,
  segmented_at timestamptz,
  recipient_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, position)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_sequence_steps TO authenticated;
GRANT ALL ON public.email_sequence_steps TO service_role;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view steps" ON public.email_sequence_steps FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert steps" ON public.email_sequence_steps FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update steps" ON public.email_sequence_steps FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete steps" ON public.email_sequence_steps FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_email_sequence_steps_updated_at BEFORE UPDATE ON public.email_sequence_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_steps_sequence ON public.email_sequence_steps(sequence_id, position);

-- 3. SEGMENTS (sous-listes auto-créées après chaque envoi)
CREATE TABLE public.email_sequence_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.email_sequence_steps(id) ON DELETE CASCADE,
  segment_type text NOT NULL, -- bounced | opened | clicked | not_opened
  list_id uuid NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  contact_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (step_id, segment_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_sequence_segments TO authenticated;
GRANT ALL ON public.email_sequence_segments TO service_role;
ALTER TABLE public.email_sequence_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view segments" ON public.email_sequence_segments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage segments" ON public.email_sequence_segments FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_segments_step ON public.email_sequence_segments(step_id);

-- Create quote templates table
CREATE TABLE public.quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_terms TEXT,
  category TEXT NOT NULL DEFAULT 'standard',
  default_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own quote templates" ON public.quote_templates
  FOR ALL
  USING (auth.uid() = user_id);
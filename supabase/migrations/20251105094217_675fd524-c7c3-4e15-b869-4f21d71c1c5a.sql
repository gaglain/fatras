-- Create table for roadshow expense notes
CREATE TABLE IF NOT EXISTS public.roadshow_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_roadshow_expenses_stop ON public.roadshow_expenses(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_expenses_user ON public.roadshow_expenses(user_id);

-- Enable RLS
ALTER TABLE public.roadshow_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own roadshow expenses"
  ON public.roadshow_expenses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own roadshow expenses"
  ON public.roadshow_expenses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own roadshow expenses"
  ON public.roadshow_expenses FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own roadshow expenses"
  ON public.roadshow_expenses FOR DELETE
  USING (user_id = auth.uid());

-- Create storage bucket for expense files
INSERT INTO storage.buckets (id, name, public)
VALUES ('roadshow-expenses', 'roadshow-expenses', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for expense files
CREATE POLICY "Users can view their own expense files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'roadshow-expenses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own expense files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'roadshow-expenses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own expense files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'roadshow-expenses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger for updated_at
CREATE TRIGGER update_roadshow_expenses_updated_at
  BEFORE UPDATE ON public.roadshow_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add detailed schedule fields to roadshow_stops
ALTER TABLE public.roadshow_stops 
ADD COLUMN IF NOT EXISTS soundcheck_time TEXT,
ADD COLUMN IF NOT EXISTS doors_time TEXT,
ADD COLUMN IF NOT EXISTS show_start_time TEXT,
ADD COLUMN IF NOT EXISTS show_end_time TEXT,
ADD COLUMN IF NOT EXISTS curfew_time TEXT;

-- Create roadshow_documents table for tech sheets, riders, etc.
CREATE TABLE public.roadshow_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  category TEXT DEFAULT 'other',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadshow_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roadshow documents" ON public.roadshow_documents
FOR SELECT USING (true);

CREATE POLICY "Users can create roadshow documents" ON public.roadshow_documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadshow documents" ON public.roadshow_documents
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadshow documents" ON public.roadshow_documents
FOR DELETE USING (auth.uid() = user_id);

-- Create roadshow_notes table for collaborative notes
CREATE TABLE public.roadshow_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadshow_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view roadshow notes" ON public.roadshow_notes
FOR SELECT USING (true);

CREATE POLICY "Users can create roadshow notes" ON public.roadshow_notes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.roadshow_notes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.roadshow_notes
FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for roadshow documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('roadshow-documents', 'roadshow-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view roadshow document files" ON storage.objects
FOR SELECT USING (bucket_id = 'roadshow-documents');

CREATE POLICY "Users can upload roadshow document files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'roadshow-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their roadshow document files" ON storage.objects
FOR DELETE USING (bucket_id = 'roadshow-documents' AND auth.uid() IS NOT NULL);

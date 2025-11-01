-- Create background_images table for storing uploaded background images
CREATE TABLE IF NOT EXISTS public.background_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.background_images ENABLE ROW LEVEL SECURITY;

-- Policies for background_images
CREATE POLICY "Users can view their own background images"
  ON public.background_images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own background images"
  ON public.background_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own background images"
  ON public.background_images
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own background images"
  ON public.background_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_background_images_updated_at
  BEFORE UPDATE ON public.background_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for background images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('background-images', 'background-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for background-images bucket
CREATE POLICY "Users can view background images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'background-images');

CREATE POLICY "Users can upload their own background images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'background-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own background images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'background-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own background images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'background-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
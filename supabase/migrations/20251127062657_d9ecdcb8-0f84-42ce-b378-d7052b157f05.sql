-- Add category column to background_images for organizing media
ALTER TABLE public.background_images 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add tags column for additional filtering
ALTER TABLE public.background_images 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add source_type to track origin (roadshow_expense, artist, etc.)
ALTER TABLE public.background_images 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'upload';

-- Add source_id to link back to original entity if needed
ALTER TABLE public.background_images 
ADD COLUMN IF NOT EXISTS source_id UUID;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_background_images_category ON public.background_images(category);
CREATE INDEX IF NOT EXISTS idx_background_images_source_type ON public.background_images(source_type);

-- Update roadshow-expenses bucket to be public for preview
UPDATE storage.buckets SET public = true WHERE id = 'roadshow-expenses';
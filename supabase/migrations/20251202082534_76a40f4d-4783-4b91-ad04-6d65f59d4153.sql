-- Add bucket_name and file_path columns to background_images for permalink support
ALTER TABLE public.background_images 
ADD COLUMN IF NOT EXISTS bucket_name TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Update existing records to extract bucket and path from URL
UPDATE public.background_images
SET 
  bucket_name = 'background-images',
  file_path = SUBSTRING(url FROM 'background-images/(.+)$')
WHERE bucket_name IS NULL AND url LIKE '%background-images%';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_background_images_bucket_path 
ON public.background_images(bucket_name, file_path);
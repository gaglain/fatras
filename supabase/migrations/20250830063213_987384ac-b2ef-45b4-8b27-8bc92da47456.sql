-- Add fields to centralized_artists table for the Show Bible elements
ALTER TABLE public.centralized_artists
ADD COLUMN IF NOT EXISTS presentation_text TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS presentation_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS tech_sheet_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS technical_contact_id UUID REFERENCES public.user_profiles(id),
ADD COLUMN IF NOT EXISTS booking_contact_id UUID REFERENCES public.user_profiles(id);
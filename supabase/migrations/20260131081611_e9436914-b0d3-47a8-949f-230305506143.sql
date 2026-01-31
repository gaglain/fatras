-- Add invitations field to roadshow_stops table
ALTER TABLE public.roadshow_stops
ADD COLUMN IF NOT EXISTS invitations TEXT;
-- Add SACEM program number field to centralized_artists table
-- This is internal/administrative data, not displayed on public frontend
ALTER TABLE public.centralized_artists 
ADD COLUMN IF NOT EXISTS sacem_program_number text;
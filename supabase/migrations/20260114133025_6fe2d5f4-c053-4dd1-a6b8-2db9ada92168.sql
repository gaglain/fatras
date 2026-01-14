-- Add SACEM program number to setlists
ALTER TABLE public.show_bible_setlists 
ADD COLUMN sacem_program_number TEXT;
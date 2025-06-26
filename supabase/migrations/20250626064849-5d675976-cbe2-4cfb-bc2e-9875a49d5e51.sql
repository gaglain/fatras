
-- Add associated_artists column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN associated_artists TEXT[] DEFAULT '{}';

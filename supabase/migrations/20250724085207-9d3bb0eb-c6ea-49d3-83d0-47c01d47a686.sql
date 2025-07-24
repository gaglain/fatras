-- Drop and recreate the get_user_profiles function with correct signature
DROP FUNCTION IF EXISTS public.get_user_profiles();

-- Fix username constraint to allow null values during creation
ALTER TABLE public.user_profiles ALTER COLUMN username DROP NOT NULL;

-- Add a default value for username that will be set to email prefix if empty
ALTER TABLE public.user_profiles ALTER COLUMN username SET DEFAULT 'user';

-- Update existing user_profiles with null username to use a default
UPDATE public.user_profiles 
SET username = COALESCE(email, 'user_' || id::text)
WHERE username IS NULL OR username = '';

-- Recreate the get_user_profiles function with extended fields
CREATE OR REPLACE FUNCTION public.get_user_profiles()
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  username text, 
  first_name text, 
  last_name text, 
  email text, 
  phone text, 
  role text, 
  avatar_url text, 
  is_active boolean, 
  address text,
  city text,
  function_title text,
  show_name text,
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    up.id,
    up.user_id,
    up.username,
    up.first_name,
    up.last_name,
    up.email,
    up.phone,
    up.role,
    up.avatar_url,
    up.is_active,
    up.address,
    up.city,
    up.function_title,
    up.show_name,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.is_active = true;
$$;

-- Clean up test notifications
DELETE FROM public.notifications 
WHERE message LIKE '%Test%' OR title LIKE '%Test%' OR message LIKE '%test%';
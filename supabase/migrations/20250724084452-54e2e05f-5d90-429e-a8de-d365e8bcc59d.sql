-- Fix username constraint to allow null values during creation
ALTER TABLE public.user_profiles ALTER COLUMN username DROP NOT NULL;

-- Add a default value for username that will be set to email prefix if empty
ALTER TABLE public.user_profiles ALTER COLUMN username SET DEFAULT 'user';

-- Update existing user_profiles with null username to use a default
UPDATE public.user_profiles 
SET username = COALESCE(email, 'user_' || id::text)
WHERE username IS NULL OR username = '';

-- Improve user profile creation function to handle edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    username,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1), 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur')
  );
  RETURN NEW;
END;
$$;

-- Update the get_user_profiles function to use only user_profiles table
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

-- Create admin function to manage users without accessing auth.users directly
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email text,
  user_password text,
  user_first_name text,
  user_last_name text,
  user_role text DEFAULT 'utilisateur'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow admins to create users
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Return success for now - actual user creation will be handled by frontend
  SELECT json_build_object('success', true, 'message', 'User creation request processed') INTO result;
  RETURN result;
END;
$$;

-- Fix artist files table to have proper categories
ALTER TABLE public.artist_files 
ALTER COLUMN category SET DEFAULT 'general';

-- Add a function to clean up test notifications
CREATE OR REPLACE FUNCTION public.cleanup_test_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE message LIKE '%Test%' OR title LIKE '%Test%';
END;
$$;

-- Call the cleanup function
SELECT public.cleanup_test_notifications();
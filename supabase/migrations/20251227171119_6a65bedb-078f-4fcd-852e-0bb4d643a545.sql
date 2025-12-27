-- Drop and recreate get_user_profiles with correct columns and search_path
DROP FUNCTION IF EXISTS public.get_user_profiles();

CREATE FUNCTION public.get_user_profiles()
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
  postal_code text, 
  function_title text, 
  show_name text, 
  contracts_fees jsonb, 
  availability jsonb, 
  skills text[], 
  associated_artists text[], 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
    up.postal_code,
    up.function_title,
    up.show_name,
    up.contracts_fees,
    up.availability,
    up.skills,
    up.associated_artists,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM user_profiles admin_check 
      WHERE admin_check.user_id = auth.uid() 
        AND admin_check.role IN ('admin', 'super_admin')
    );
$$;
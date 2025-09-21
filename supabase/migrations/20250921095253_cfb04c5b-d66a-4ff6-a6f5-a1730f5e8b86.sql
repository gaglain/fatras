-- Fix user_profiles FK issue and wire profile creation via trigger
DO $$ BEGIN
  -- Drop FK if exists to allow temporary NULL user_id
  ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
EXCEPTION WHEN others THEN NULL; END $$;

-- Make user_id nullable to allow pre-auth profile creation
ALTER TABLE public.user_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Ensure trigger on auth.users exists to link profiles on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Update helper to create profile without requiring existing auth user
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  user_email text,
  user_password text,
  profile_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Prevent duplicates
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE email = user_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un utilisateur avec cet email existe déjà');
  END IF;

  -- Create profile with NULL user_id (will be linked by trigger upon real signup)
  INSERT INTO public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    username,
    phone,
    role,
    address,
    city,
    function_title,
    show_name,
    birth_date,
    birth_place,
    social_security_number,
    guso_id,
    nationality,
    bank_details,
    contracts_fees,
    availability,
    skills,
    identity_documents,
    is_active
  ) VALUES (
    NULL,
    user_email,
    COALESCE(profile_data->>'first_name', ''),
    COALESCE(profile_data->>'last_name', ''),
    COALESCE(profile_data->>'username', split_part(user_email, '@', 1)),
    COALESCE(profile_data->>'phone', ''),
    COALESCE(profile_data->>'role', 'utilisateur'),
    COALESCE(profile_data->>'address', ''),
    COALESCE(profile_data->>'city', ''),
    COALESCE(profile_data->>'function_title', ''),
    COALESCE(profile_data->>'show_name', ''),
    CASE WHEN profile_data->>'birth_date' != '' AND profile_data->>'birth_date' IS NOT NULL 
         THEN (profile_data->>'birth_date')::date ELSE NULL END,
    COALESCE(profile_data->>'birth_place', ''),
    COALESCE(profile_data->>'social_security_number', ''),
    COALESCE(profile_data->>'guso_id', ''),
    COALESCE(profile_data->>'nationality', ''),
    COALESCE(profile_data->'bank_details', '{}'::jsonb),
    COALESCE(profile_data->'contracts_fees', '[]'::jsonb),
    profile_data->'availability',
    COALESCE((SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'skills')), '{}'::text[]),
    COALESCE(profile_data->'identity_documents', '[]'::jsonb),
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'email', user_email,
    'message', 'Profil créé. Le compte auth sera lié automatiquement lors de l’inscription.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
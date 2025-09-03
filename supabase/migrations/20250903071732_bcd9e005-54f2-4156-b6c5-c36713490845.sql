-- Corriger la fonction de création d'utilisateur pour résoudre l'erreur jsonb/json
CREATE OR REPLACE FUNCTION public.create_user_with_profile(user_email text, user_password text, profile_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  temp_user_id uuid;
  result jsonb;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM user_profiles WHERE email = user_email) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Un utilisateur avec cet email existe déjà'
    );
  END IF;

  -- Générer un UUID temporaire unique
  temp_user_id := gen_random_uuid();
  
  -- Créer le profil utilisateur avec un UUID temporaire
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
    temp_user_id,
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
    COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(profile_data->'skills')),
      '{}'::text[]
    ),
    COALESCE(profile_data->'identity_documents', '[]'::jsonb),
    true
  );

  -- Retourner le succès
  RETURN jsonb_build_object(
    'success', true,
    'user_id', temp_user_id,
    'email', user_email,
    'message', 'Profil créé avec succès. L''authentification sera gérée côté client.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;
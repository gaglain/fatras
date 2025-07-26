-- Améliorer la gestion de création d'utilisateurs
-- Créer une fonction RPC pour créer des utilisateurs de manière sécurisée

CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  user_email text,
  user_password text,
  profile_data json
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'User with this email already exists'
    );
  END IF;

  -- Créer le profil utilisateur directement (l'auth sera gérée côté client)
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
    is_active
  ) VALUES (
    gen_random_uuid(), -- Générer un UUID temporaire qui sera remplacé par l'auth
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
    true
  ) RETURNING user_id INTO new_user_id;

  -- Retourner le succès avec l'ID
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Améliorer la fonction handle_new_user_profile pour être plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mettre à jour le profil existant avec l'auth user_id si il existe déjà par email
  UPDATE public.user_profiles 
  SET 
    user_id = NEW.id,
    updated_at = now()
  WHERE email = NEW.email AND user_id != NEW.id;

  -- Si aucune mise à jour n'a été faite, créer un nouveau profil
  IF NOT FOUND THEN
    INSERT INTO public.user_profiles (
      user_id, 
      email, 
      first_name, 
      last_name, 
      username,
      role,
      is_active
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur'),
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
-- Fixer les problèmes critiques du système utilisateur

-- 1. Supprimer les anciennes données de test dans notifications
DELETE FROM public.notifications;

-- 2. Créer une fonction pour obtenir les utilisateurs via user_profiles
CREATE OR REPLACE FUNCTION public.get_user_profiles()
RETURNS TABLE (
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
  created_at timestamptz,
  updated_at timestamptz
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
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.is_active = true;
$$;

-- 3. Fonction pour créer un utilisateur complet avec auth et profil
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  user_email text,
  user_password text,
  user_first_name text,
  user_last_name text,
  user_username text DEFAULT NULL,
  user_phone text DEFAULT NULL,
  user_role text DEFAULT 'utilisateur'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Créer l'utilisateur auth
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated', 
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object(
      'first_name', user_first_name,
      'last_name', user_last_name,
      'email', user_email
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Créer le profil utilisateur
  INSERT INTO public.user_profiles (
    user_id,
    username,
    first_name,
    last_name,
    email,
    phone,
    role,
    is_active
  ) VALUES (
    new_user_id,
    COALESCE(user_username, split_part(user_email, '@', 1)),
    user_first_name,
    user_last_name,
    user_email,
    user_phone,
    user_role,
    true
  );

  -- Retourner le résultat
  SELECT json_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'success', true
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 4. Fonction pour mettre à jour un profil utilisateur
CREATE OR REPLACE FUNCTION public.update_user_profile_data(
  profile_user_id uuid,
  profile_data json
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  UPDATE public.user_profiles 
  SET 
    first_name = COALESCE(profile_data->>'first_name', first_name),
    last_name = COALESCE(profile_data->>'last_name', last_name),
    username = COALESCE(profile_data->>'username', username),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = now()
  WHERE user_id = profile_user_id;

  IF FOUND THEN
    SELECT json_build_object('success', true, 'updated', true) INTO result;
  ELSE
    SELECT json_build_object('success', false, 'error', 'Profile not found') INTO result;
  END IF;

  RETURN result;
END;
$$;

-- 5. Ajouter une colonne avatar_url manquante si elle n'existe pas
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
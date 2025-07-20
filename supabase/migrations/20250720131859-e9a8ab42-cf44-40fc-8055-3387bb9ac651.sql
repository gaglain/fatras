-- Ajouter les colonnes manquantes et corriger le système utilisateur

-- 1. Ajouter les colonnes manquantes
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Supprimer les anciennes données de test dans notifications
DELETE FROM public.notifications;

-- 3. Créer une fonction pour obtenir les utilisateurs via user_profiles
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
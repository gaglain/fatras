-- Créer la fonction RPC pour mettre à jour le profil utilisateur
CREATE OR REPLACE FUNCTION public.update_user_profile_data(
  profile_user_id UUID,
  profile_data JSON
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data JSON;
BEGIN
  -- Vérifier que l'utilisateur connecté peut modifier ce profil
  IF auth.uid() != profile_user_id AND NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Mettre à jour le profil
  UPDATE user_profiles
  SET 
    first_name = COALESCE(profile_data->>'first_name', first_name),
    last_name = COALESCE(profile_data->>'last_name', last_name),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = NOW()
  WHERE user_id = profile_user_id;

  -- Récupérer le profil mis à jour
  SELECT to_json(up.*) INTO result_data
  FROM user_profiles up
  WHERE up.user_id = profile_user_id;

  RETURN result_data;
END;
$$;
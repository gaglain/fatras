-- Supprimer l'ancienne version de la fonction qui cause le conflit
DROP FUNCTION IF EXISTS public.create_user_with_profile(user_email text, user_password text, profile_data json);

-- Garder seulement la version jsonb
-- (La fonction jsonb est déjà créée et fonctionne correctement)
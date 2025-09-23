-- Mettre à jour la fonction delete_user_completely pour gérer les profils sans user_id
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    current_user_role text;
    profile_exists boolean;
BEGIN
    -- Vérifier que l'utilisateur actuel est admin
    SELECT role INTO current_user_role
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    IF current_user_role NOT IN ('admin', 'super_admin') THEN
        RETURN json_build_object('success', false, 'error', 'Accès non autorisé');
    END IF;
    
    -- Vérifier d'abord si on cherche par user_id ou par profile id
    -- Si target_user_id correspond à un user_id, on supprime par user_id
    -- Sinon, on considère que c'est un id de profil
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = target_user_id) INTO profile_exists;
    
    IF profile_exists THEN
        -- Supprimer le profil par user_id
        DELETE FROM user_profiles WHERE user_id = target_user_id;
    ELSE
        -- Supprimer le profil par id (pour les profils sans user_id)
        DELETE FROM user_profiles WHERE id = target_user_id;
    END IF;
    
    -- Vérifier si la suppression a eu lieu
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé');
    END IF;
    
    RETURN json_build_object('success', true, 'message', 'Utilisateur supprimé avec succès');
    
EXCEPTION WHEN others THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
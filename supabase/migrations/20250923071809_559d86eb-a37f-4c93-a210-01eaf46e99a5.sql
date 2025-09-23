-- Secure search_path for delete_user_completely
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_user_role text;
    profile_exists boolean;
BEGIN
    SELECT role INTO current_user_role
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    IF current_user_role NOT IN ('admin', 'super_admin') THEN
        RETURN json_build_object('success', false, 'error', 'Accès non autorisé');
    END IF;

    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = target_user_id) INTO profile_exists;
    
    IF profile_exists THEN
        DELETE FROM user_profiles WHERE user_id = target_user_id;
    ELSE
        DELETE FROM user_profiles WHERE id = target_user_id;
    END IF;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé');
    END IF;
    
    RETURN json_build_object('success', true, 'message', 'Utilisateur supprimé avec succès');
    
EXCEPTION WHEN others THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
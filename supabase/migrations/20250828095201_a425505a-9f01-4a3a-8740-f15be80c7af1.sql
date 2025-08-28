-- Corriger la fonction get_user_profiles pour permettre aux admins de supprimer des utilisateurs
CREATE OR REPLACE FUNCTION public.get_user_profiles()
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
    birth_date date, 
    birth_place text, 
    social_security_number text, 
    guso_id text, 
    nationality text, 
    bank_details jsonb, 
    contracts_fees jsonb, 
    availability jsonb, 
    skills text[], 
    identity_documents jsonb, 
    associated_artists text[], 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
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
        up.birth_date,
        up.birth_place,
        up.social_security_number,
        up.guso_id,
        up.nationality,
        up.bank_details,
        up.contracts_fees,
        up.availability,
        up.skills,
        up.identity_documents,
        up.associated_artists,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles admin_check 
        WHERE admin_check.user_id = auth.uid() 
        AND admin_check.role IN ('admin', 'super_admin')
    );
$$;

-- Permettre aux admins de modifier tous les profils utilisateurs
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM user_profiles admin_check 
        WHERE admin_check.user_id = auth.uid() 
        AND admin_check.role IN ('admin', 'super_admin')
    )
);

-- Permettre aux admins de supprimer des profils utilisateurs
CREATE POLICY "Admins can delete user profiles" 
ON public.user_profiles 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles admin_check 
        WHERE admin_check.user_id = auth.uid() 
        AND admin_check.role IN ('admin', 'super_admin')
    )
);

-- Fonction pour supprimer complètement un utilisateur (profile + auth)
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role text;
BEGIN
    -- Vérifier que l'utilisateur actuel est admin
    SELECT role INTO current_user_role
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    IF current_user_role NOT IN ('admin', 'super_admin') THEN
        RETURN json_build_object('success', false, 'error', 'Accès non autorisé');
    END IF;
    
    -- Supprimer le profil utilisateur
    DELETE FROM user_profiles WHERE user_id = target_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Utilisateur supprimé avec succès');
    
EXCEPTION WHEN others THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
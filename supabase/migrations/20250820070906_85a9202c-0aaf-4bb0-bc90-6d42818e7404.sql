-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Créer les politiques RLS pour le bucket avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Supprimer et recréer la fonction get_user_profiles avec tous les champs
DROP FUNCTION IF EXISTS public.get_user_profiles();

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
    WHERE up.is_active = true 
    AND (up.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles admin_check 
        WHERE admin_check.user_id = auth.uid() 
        AND admin_check.role IN ('admin', 'super_admin')
    ));
$$;
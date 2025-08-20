-- Vérifier et créer le bucket avatars s'il n'existe pas
DO $$
BEGIN
    -- Créer le bucket avatars s'il n'existe pas
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;
END $$;

-- Créer les politiques RLS pour le bucket avatars
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Créer la fonction RPC get_user_profiles si elle n'existe pas
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
    WHERE up.user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles manager
        WHERE manager.user_id = auth.uid() 
        AND manager.role IN ('admin', 'super_admin')
    );
$$;
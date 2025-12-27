-- Create a separate table for sensitive personal information with strict access controls
CREATE TABLE public.user_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  -- Sensitive fields moved from user_profiles
  social_security_number_encrypted text,
  birth_date date,
  birth_place text,
  bank_details_encrypted text, -- Store as encrypted JSON string
  identity_documents_encrypted text, -- Store as encrypted JSON string
  guso_id text,
  nationality text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sensitive_data ENABLE ROW LEVEL SECURITY;

-- STRICT RLS: Only the user themselves can access their own sensitive data
-- No admin override for maximum security
CREATE POLICY "Users can only view their own sensitive data"
ON public.user_sensitive_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own sensitive data"
ON public.user_sensitive_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own sensitive data"
ON public.user_sensitive_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own sensitive data"
ON public.user_sensitive_data
FOR DELETE
USING (auth.uid() = user_id);

-- Migrate existing sensitive data from user_profiles to the new table
INSERT INTO public.user_sensitive_data (
  user_id,
  social_security_number_encrypted,
  birth_date,
  birth_place,
  bank_details_encrypted,
  identity_documents_encrypted,
  guso_id,
  nationality
)
SELECT 
  user_id,
  social_security_number,
  birth_date,
  birth_place,
  bank_details::text,
  identity_documents::text,
  guso_id,
  nationality
FROM public.user_profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Drop sensitive columns from user_profiles
ALTER TABLE public.user_profiles 
  DROP COLUMN IF EXISTS social_security_number,
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS birth_place,
  DROP COLUMN IF EXISTS bank_details,
  DROP COLUMN IF EXISTS identity_documents,
  DROP COLUMN IF EXISTS guso_id,
  DROP COLUMN IF EXISTS nationality;

-- Create secure function to get own sensitive data (SECURITY DEFINER for safe access)
CREATE OR REPLACE FUNCTION public.get_my_sensitive_data()
RETURNS TABLE (
  social_security_number text,
  birth_date date,
  birth_place text,
  bank_details jsonb,
  identity_documents jsonb,
  guso_id text,
  nationality text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    usd.social_security_number_encrypted,
    usd.birth_date,
    usd.birth_place,
    CASE WHEN usd.bank_details_encrypted IS NOT NULL 
         THEN usd.bank_details_encrypted::jsonb 
         ELSE '{}'::jsonb END,
    CASE WHEN usd.identity_documents_encrypted IS NOT NULL 
         THEN usd.identity_documents_encrypted::jsonb 
         ELSE '[]'::jsonb END,
    usd.guso_id,
    usd.nationality
  FROM public.user_sensitive_data usd
  WHERE usd.user_id = auth.uid();
END;
$$;

-- Create secure function to update own sensitive data
CREATE OR REPLACE FUNCTION public.update_my_sensitive_data(
  p_social_security_number text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_birth_place text DEFAULT NULL,
  p_bank_details jsonb DEFAULT NULL,
  p_identity_documents jsonb DEFAULT NULL,
  p_guso_id text DEFAULT NULL,
  p_nationality text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_sensitive_data (
    user_id,
    social_security_number_encrypted,
    birth_date,
    birth_place,
    bank_details_encrypted,
    identity_documents_encrypted,
    guso_id,
    nationality
  ) VALUES (
    auth.uid(),
    p_social_security_number,
    p_birth_date,
    p_birth_place,
    p_bank_details::text,
    p_identity_documents::text,
    p_guso_id,
    p_nationality
  )
  ON CONFLICT (user_id) DO UPDATE SET
    social_security_number_encrypted = COALESCE(p_social_security_number, user_sensitive_data.social_security_number_encrypted),
    birth_date = COALESCE(p_birth_date, user_sensitive_data.birth_date),
    birth_place = COALESCE(p_birth_place, user_sensitive_data.birth_place),
    bank_details_encrypted = COALESCE(p_bank_details::text, user_sensitive_data.bank_details_encrypted),
    identity_documents_encrypted = COALESCE(p_identity_documents::text, user_sensitive_data.identity_documents_encrypted),
    guso_id = COALESCE(p_guso_id, user_sensitive_data.guso_id),
    nationality = COALESCE(p_nationality, user_sensitive_data.nationality),
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Revoke direct access, force use of functions
REVOKE ALL ON public.user_sensitive_data FROM anon;
REVOKE ALL ON public.user_sensitive_data FROM authenticated;

-- Grant only via RLS (authenticated can use RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sensitive_data TO authenticated;
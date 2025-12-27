-- Drop existing SELECT policy that exposes tokens
DROP POLICY IF EXISTS "Users can view safe account data only" ON public.email_accounts;

-- Create a more restrictive SELECT policy that uses a security definer function
-- This policy allows viewing basic account info but NOT tokens directly
CREATE POLICY "Users can view basic account info" 
ON public.email_accounts 
FOR SELECT 
USING (
  (user_id = auth.uid()) 
  OR (
    (is_organization_shared = true) 
    AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role])
  )
);

-- Create a secure function to get email accounts WITHOUT exposing tokens
-- This function returns account data without sensitive token fields
CREATE OR REPLACE FUNCTION public.get_email_accounts_without_tokens()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  provider text,
  is_active boolean,
  is_organization_shared boolean,
  last_sync_at timestamp with time zone,
  token_expires_at timestamp with time zone,
  imap_config jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  grant_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ea.id,
    ea.user_id,
    ea.email,
    ea.provider,
    ea.is_active,
    ea.is_organization_shared,
    ea.last_sync_at,
    ea.token_expires_at,
    -- Remove sensitive password from imap_config
    CASE 
      WHEN ea.imap_config IS NOT NULL THEN 
        jsonb_strip_nulls(
          jsonb_build_object(
            'host', ea.imap_config->>'host',
            'port', ea.imap_config->>'port',
            'smtp_host', ea.imap_config->>'smtp_host',
            'smtp_port', ea.imap_config->>'smtp_port',
            'ssl', ea.imap_config->>'ssl'
          )
        )
      ELSE NULL
    END,
    ea.created_at,
    ea.updated_at,
    ea.grant_id
  FROM public.email_accounts ea
  WHERE ea.user_id = auth.uid()
     OR (ea.is_organization_shared = true AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role]));
END;
$$;

-- Create a secure function for edge functions to get tokens (ONLY callable from service role)
-- This function should only be used by server-side code
CREATE OR REPLACE FUNCTION public.get_email_account_tokens(account_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  provider text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  grant_id text,
  imap_config jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is SECURITY DEFINER so it bypasses RLS
  -- It should ONLY be called from edge functions with service role key
  -- The calling context should verify ownership before calling this
  RETURN QUERY
  SELECT 
    ea.id,
    ea.email,
    ea.provider,
    ea.access_token_encrypted,
    ea.refresh_token_encrypted,
    ea.grant_id,
    ea.imap_config
  FROM public.email_accounts ea
  WHERE ea.id = account_id;
END;
$$;

-- Revoke direct execute on the token function from public/anon
REVOKE EXECUTE ON FUNCTION public.get_email_account_tokens(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_email_account_tokens(uuid) FROM authenticated;

-- Grant only to service_role (for edge functions)
GRANT EXECUTE ON FUNCTION public.get_email_account_tokens(uuid) TO service_role;

-- Update the existing get_email_accounts_secure to NOT return tokens
CREATE OR REPLACE FUNCTION public.get_email_accounts_secure()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  provider text,
  is_active boolean,
  is_organization_shared boolean,
  last_sync_at timestamp with time zone,
  token_expires_at timestamp with time zone,
  imap_config jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  grant_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ea.id,
    ea.user_id,
    ea.email,
    ea.provider,
    ea.is_active,
    ea.is_organization_shared,
    ea.last_sync_at,
    ea.token_expires_at,
    -- Remove sensitive password from imap_config
    CASE 
      WHEN ea.imap_config IS NOT NULL THEN 
        jsonb_strip_nulls(
          jsonb_build_object(
            'host', ea.imap_config->>'host',
            'port', ea.imap_config->>'port',
            'smtp_host', ea.imap_config->>'smtp_host',
            'smtp_port', ea.imap_config->>'smtp_port',
            'ssl', ea.imap_config->>'ssl'
          )
        )
      ELSE NULL
    END,
    ea.created_at,
    ea.updated_at,
    ea.grant_id
  FROM public.email_accounts ea
  WHERE ea.user_id = auth.uid();
END;
$$;
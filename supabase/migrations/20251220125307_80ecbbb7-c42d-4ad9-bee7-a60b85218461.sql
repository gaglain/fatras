-- Fix the security definer view issue by using a function instead
DROP VIEW IF EXISTS public.email_accounts_secure;

-- Create a secure function to get email accounts with decrypted tokens
CREATE OR REPLACE FUNCTION public.get_email_accounts_secure()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  provider text,
  is_active boolean,
  is_organization_shared boolean,
  last_sync_at timestamptz,
  token_expires_at timestamptz,
  imap_config jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  access_token text,
  refresh_token text
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
    ea.imap_config,
    ea.created_at,
    ea.updated_at,
    public.decrypt_token(ea.access_token_encrypted) as access_token,
    public.decrypt_token(ea.refresh_token_encrypted) as refresh_token
  FROM public.email_accounts ea
  WHERE ea.user_id = auth.uid();
END;
$$;

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION public.get_email_accounts_secure() TO authenticated;
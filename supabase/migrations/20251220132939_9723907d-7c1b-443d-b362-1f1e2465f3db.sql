-- Drop and recreate the function with new return type
DROP FUNCTION IF EXISTS public.get_email_accounts_secure();

CREATE FUNCTION public.get_email_accounts_secure()
 RETURNS TABLE(id uuid, user_id uuid, email text, provider text, is_active boolean, is_organization_shared boolean, last_sync_at timestamp with time zone, token_expires_at timestamp with time zone, imap_config jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, grant_id text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ea.grant_id
  FROM public.email_accounts ea
  WHERE ea.user_id = auth.uid();
END;
$function$;

-- Also drop and recreate the upsert function
DROP FUNCTION IF EXISTS public.upsert_email_account(text, text, text, text, timestamp with time zone, jsonb);

CREATE FUNCTION public.upsert_email_account(p_email text, p_provider text, p_grant_id text DEFAULT NULL::text, p_token_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_imap_config jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.email_accounts (
    user_id,
    email,
    provider,
    grant_id,
    token_expires_at,
    imap_config,
    is_active
  ) VALUES (
    auth.uid(),
    p_email,
    p_provider,
    p_grant_id,
    p_token_expires_at,
    p_imap_config,
    true
  )
  ON CONFLICT (email, user_id) 
  DO UPDATE SET
    grant_id = COALESCE(p_grant_id, email_accounts.grant_id),
    token_expires_at = COALESCE(p_token_expires_at, email_accounts.token_expires_at),
    imap_config = COALESCE(p_imap_config, email_accounts.imap_config),
    updated_at = now()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$function$;
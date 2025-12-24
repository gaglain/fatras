-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.email_accounts_safe;

-- Recreate as SECURITY INVOKER (default, safer) - RLS policies will apply
CREATE VIEW public.email_accounts_safe 
WITH (security_invoker = true)
AS
SELECT 
    id,
    email,
    provider,
    is_active,
    is_organization_shared,
    last_sync_at,
    created_at,
    updated_at,
    user_id,
    CASE
        WHEN imap_config IS NOT NULL THEN jsonb_strip_nulls(jsonb_build_object(
            'host', imap_config ->> 'host',
            'port', imap_config ->> 'port',
            'smtp_host', imap_config ->> 'smtp_host',
            'smtp_port', imap_config ->> 'smtp_port',
            'ssl', imap_config ->> 'ssl'
        ))
        ELSE NULL
    END AS imap_config
FROM public.email_accounts;
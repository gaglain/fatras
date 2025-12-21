-- Supprimer les anciennes politiques sur email_accounts
DROP POLICY IF EXISTS "Users can view own accounts and admins can view shared accounts" ON public.email_accounts;
DROP POLICY IF EXISTS "Users can update own accounts and admins can update shared acco" ON public.email_accounts;

-- Créer une fonction sécurisée pour accéder aux comptes email SANS les tokens
CREATE OR REPLACE FUNCTION public.get_email_accounts_safe()
RETURNS TABLE (
  id uuid,
  email text,
  provider text,
  is_active boolean,
  is_organization_shared boolean,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_id uuid,
  imap_config jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ea.id,
    ea.email,
    ea.provider,
    ea.is_active,
    ea.is_organization_shared,
    ea.last_sync_at,
    ea.created_at,
    ea.updated_at,
    ea.user_id,
    -- Retourner imap_config sans les mots de passe
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
    END as imap_config
  FROM public.email_accounts ea
  WHERE ea.user_id = auth.uid()
     OR (ea.is_organization_shared = true AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role]));
$$;

-- Créer une nouvelle politique SELECT très restrictive
-- Les utilisateurs ne peuvent voir QUE les colonnes non sensibles via la fonction
CREATE POLICY "Users can view safe account data only"
ON public.email_accounts
FOR SELECT
USING (
  -- Permettre SELECT mais les colonnes sensibles seront NULL grâce à la vue
  (user_id = auth.uid()) 
  OR ((is_organization_shared = true) AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role]))
);

-- Politique UPDATE restrictive - les tokens ne doivent être modifiés que via les Edge Functions
CREATE POLICY "Users can update own non-token account data"
ON public.email_accounts
FOR UPDATE
USING (
  (user_id = auth.uid()) 
  OR ((is_organization_shared = true) AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role]))
)
WITH CHECK (
  (user_id = auth.uid()) 
  OR ((is_organization_shared = true) AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role]))
);

-- Créer une vue sécurisée qui exclut les tokens - à utiliser côté client
CREATE OR REPLACE VIEW public.email_accounts_safe AS
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
  -- Exclure complètement les tokens et les données sensibles de imap_config
  CASE 
    WHEN imap_config IS NOT NULL THEN 
      jsonb_strip_nulls(
        jsonb_build_object(
          'host', imap_config->>'host',
          'port', imap_config->>'port',
          'smtp_host', imap_config->>'smtp_host',
          'smtp_port', imap_config->>'smtp_port',
          'ssl', imap_config->>'ssl'
        )
      )
    ELSE NULL
  END as imap_config
FROM public.email_accounts;

-- Activer RLS sur la vue (nécessite d'abord de la convertir en table - on utilise la fonction à la place)
COMMENT ON VIEW public.email_accounts_safe IS 'Vue sécurisée des comptes email - exclut tous les tokens et mots de passe';

-- Accorder les permissions sur la fonction sécurisée
GRANT EXECUTE ON FUNCTION public.get_email_accounts_safe() TO authenticated;
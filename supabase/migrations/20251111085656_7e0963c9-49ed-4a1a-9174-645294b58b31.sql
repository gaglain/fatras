-- Corriger les RLS policies pour email_accounts pour permettre l'accès aux comptes partagés

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can manage their own email accounts" ON email_accounts;
DROP POLICY IF EXISTS "email_accounts_delete_own" ON email_accounts;
DROP POLICY IF EXISTS "email_accounts_insert_own" ON email_accounts;
DROP POLICY IF EXISTS "email_accounts_select_own" ON email_accounts;
DROP POLICY IF EXISTS "email_accounts_update_own" ON email_accounts;

-- Policy SELECT : les utilisateurs voient leurs comptes + les admins/managers voient aussi les comptes partagés
CREATE POLICY "Users can view own accounts and admins can view shared accounts"
ON email_accounts
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR (
    is_organization_shared = true 
    AND has_any_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']::app_role[])
  )
);

-- Policy INSERT : les utilisateurs peuvent créer leurs propres comptes
CREATE POLICY "Users can create their own email accounts"
ON email_accounts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy UPDATE : les utilisateurs peuvent modifier leurs comptes + les admins peuvent modifier les comptes partagés
CREATE POLICY "Users can update own accounts and admins can update shared accounts"
ON email_accounts
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR (
    is_organization_shared = true 
    AND has_any_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']::app_role[])
  )
)
WITH CHECK (
  user_id = auth.uid() 
  OR (
    is_organization_shared = true 
    AND has_any_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager']::app_role[])
  )
);

-- Policy DELETE : seuls les propriétaires peuvent supprimer (sauf super_admin)
CREATE POLICY "Users can delete own accounts and super_admins can delete any"
ON email_accounts
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
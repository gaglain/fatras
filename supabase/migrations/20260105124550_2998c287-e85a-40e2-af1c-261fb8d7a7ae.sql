
-- =====================================================
-- MISE À JOUR DES POLITIQUES RLS POUR LA COLLABORATION
-- =====================================================

-- 1. USER_PROFILES - Tous les utilisateurs authentifiés peuvent voir tous les profils
DROP POLICY IF EXISTS "Users view own or super_admin views all user_profiles" ON user_profiles;
CREATE POLICY "Authenticated users can view all user_profiles"
ON user_profiles FOR SELECT TO authenticated
USING (true);

-- 2. EMAIL_TEMPLATES - Tous peuvent voir et les admin/manager peuvent modifier tous
DROP POLICY IF EXISTS "Users can view their own templates and system templates" ON email_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON email_templates;

CREATE POLICY "Authenticated users can view all email templates"
ON email_templates FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create email templates"
ON email_templates FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update email templates"
ON email_templates FOR UPDATE TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete email templates"
ON email_templates FOR DELETE TO authenticated
USING (true);

-- 3. CONTACT_TYPES - Partagés pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can manage their own contact types" ON contact_types;

CREATE POLICY "Authenticated users can manage all contact types"
ON contact_types FOR ALL TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. CONTACT_LISTS - Partagées pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can manage own contact lists" ON contact_lists;
-- Keep the existing SELECT policy

CREATE POLICY "Authenticated users can manage all contact lists"
ON contact_lists FOR ALL TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. CONTACT_LIST_MEMBERS - Partagés pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users manage own contact list members" ON contact_list_members;

CREATE POLICY "Authenticated users can view all contact list members"
ON contact_list_members FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage all contact list members"
ON contact_list_members FOR ALL TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. EMAIL_CAMPAIGNS - Partagées pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can manage their own email campaigns" ON email_campaigns;
-- Keep existing view policy

CREATE POLICY "Authenticated users can manage all email campaigns"
ON email_campaigns FOR ALL TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

-- 7. ROADSHOW_EXPENSES - Tous les utilisateurs authentifiés peuvent voir et gérer
DROP POLICY IF EXISTS "Users can view their own roadshow expenses" ON roadshow_expenses;
DROP POLICY IF EXISTS "Users can create their own roadshow expenses" ON roadshow_expenses;
DROP POLICY IF EXISTS "Users can insert their own roadshow expenses" ON roadshow_expenses;
DROP POLICY IF EXISTS "Users can update their own roadshow expenses" ON roadshow_expenses;
DROP POLICY IF EXISTS "Users can delete their own roadshow expenses" ON roadshow_expenses;

CREATE POLICY "Authenticated users can view all roadshow expenses"
ON roadshow_expenses FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create roadshow expenses"
ON roadshow_expenses FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update roadshow expenses"
ON roadshow_expenses FOR UPDATE TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete roadshow expenses"
ON roadshow_expenses FOR DELETE TO authenticated
USING (true);

-- 8. QUOTE_TEMPLATES - Partagés pour tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can manage own quote templates" ON quote_templates;

CREATE POLICY "Authenticated users can view all quote templates"
ON quote_templates FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage all quote templates"
ON quote_templates FOR ALL TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

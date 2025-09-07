-- Corriger le problème de politique déjà existante et finaliser les politiques RLS manquantes

-- App Settings
DROP POLICY IF EXISTS "Users can view their own app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can create their own app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can update their own app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users can delete their own app settings" ON public.app_settings;

CREATE POLICY "All authenticated users can manage all app settings" 
ON public.app_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Forms
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;

CREATE POLICY "All authenticated users can manage all forms" 
ON public.forms 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Contact Lists Members (s'il existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_list_members' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can manage own contact list members" ON public.contact_list_members;
        CREATE POLICY "All authenticated users can manage all contact list members" 
        ON public.contact_list_members 
        FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Website Pages
DROP POLICY IF EXISTS "Users can manage own website pages" ON public.website_pages;
CREATE POLICY "All authenticated users can manage all website pages" 
ON public.website_pages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Website Menu
DROP POLICY IF EXISTS "Users can manage own website menu" ON public.website_menu;
CREATE POLICY "All authenticated users can manage all website menu" 
ON public.website_menu 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
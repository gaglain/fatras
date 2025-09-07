-- Corriger les politiques RLS pour permettre la gestion collaborative des utilisateurs
-- Activer RLS sur profiles si ce n'est pas déjà fait
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques restrictives sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Créer de nouvelles politiques collaboratives pour profiles
CREATE POLICY "All authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (true);

-- Corriger les politiques pour user_profiles si cette table existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        -- Activer RLS si pas déjà fait
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Supprimer les politiques restrictives existantes
        DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
        DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
        
        -- Créer de nouvelles politiques collaboratives
        CREATE POLICY "All authenticated users can manage all user profiles" 
        ON public.user_profiles 
        FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Corriger les politiques pour toutes les autres tables importantes manquantes
-- Centralized Artists
DROP POLICY IF EXISTS "Users can manage own artists" ON public.centralized_artists;
CREATE POLICY "All authenticated users can manage all artists" 
ON public.centralized_artists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Email Campaigns (déjà corrigé normalement mais vérification)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.email_campaigns;

CREATE POLICY "All authenticated users can manage all email campaigns" 
ON public.email_campaigns 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Contact Lists
DROP POLICY IF EXISTS "Users can manage own contact lists" ON public.contact_lists;
CREATE POLICY "All authenticated users can manage all contact lists" 
ON public.contact_lists 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Email Templates
DROP POLICY IF EXISTS "Users can view their own templates and system templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;

CREATE POLICY "All authenticated users can manage all email templates" 
ON public.email_templates 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
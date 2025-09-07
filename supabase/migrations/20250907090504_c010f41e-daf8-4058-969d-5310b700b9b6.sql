-- Corriger les politiques pour user_profiles pour permettre la collaboration
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users and admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.user_profiles;

-- Créer de nouvelles politiques collaboratives pour user_profiles
CREATE POLICY "All authenticated users can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can insert user profiles" 
ON public.user_profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update user profiles" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "All authenticated users can delete user profiles" 
ON public.user_profiles 
FOR DELETE 
TO authenticated 
USING (true);

-- Corriger aussi les politiques pour profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

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
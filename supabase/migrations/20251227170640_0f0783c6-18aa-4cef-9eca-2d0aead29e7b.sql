-- Update user_sensitive_data policies: only owner OR super_admin can access
DROP POLICY IF EXISTS "Users can only view their own sensitive data" ON public.user_sensitive_data;
DROP POLICY IF EXISTS "Users can only update their own sensitive data" ON public.user_sensitive_data;

CREATE POLICY "Users view own or super_admin views all sensitive data"
ON public.user_sensitive_data
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users update own or super_admin updates all sensitive data"
ON public.user_sensitive_data
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix contacts table: only owner OR super_admin can view
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;

CREATE POLICY "Users view own or super_admin views all contacts"
ON public.contacts
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix profiles table: only owner OR super_admin can view
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users view own or super_admin views all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix user_profiles table as well: only owner OR super_admin can view all
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.user_profiles;

CREATE POLICY "Users view own or super_admin views all user_profiles"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
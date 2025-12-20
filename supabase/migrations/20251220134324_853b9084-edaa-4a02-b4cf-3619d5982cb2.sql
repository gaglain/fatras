
-- Step 1: Drop all policies that depend on is_admin_user()
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile or admins insert" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile or admins delete" ON public.user_profiles;

-- Step 2: Update is_admin_user() to use the secure user_roles table
-- instead of checking the role column on user_profiles (which users can modify)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin'::app_role, 'super_admin'::app_role)
  );
$$;

-- Step 3: Recreate the profiles policy using has_role()
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Step 4: Recreate user_profiles policies using has_role()
CREATE POLICY "Users can view own profile or admins view all"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update own profile or admins update"
ON public.user_profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can insert own profile or admins insert"
ON public.user_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can delete profiles - admins only"
ON public.user_profiles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

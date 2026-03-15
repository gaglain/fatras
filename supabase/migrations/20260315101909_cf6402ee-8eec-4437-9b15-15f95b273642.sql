
-- Drop the existing permissive SELECT policy on user_profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;

-- Create new SELECT policy: own profile OR super_admin
CREATE POLICY "Users can read own profile or super_admin reads all"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

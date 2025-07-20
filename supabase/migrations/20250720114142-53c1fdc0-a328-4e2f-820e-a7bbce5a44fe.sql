-- Fix infinite recursion in user_profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Create a fixed policy that doesn't reference itself
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'role' IN ('super_admin', 'admin')
  )
  OR auth.uid() = user_id
);
-- Modifier la politique RLS pour permettre aux admins de créer des profils
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users and admins can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM user_profiles admin_check 
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role IN ('admin', 'super_admin')
  )
);
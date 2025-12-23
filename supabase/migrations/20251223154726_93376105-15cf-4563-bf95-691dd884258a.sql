-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can create their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete all contacts" ON public.contacts;

-- Restore collaborative access for all authenticated users
CREATE POLICY "Authenticated users can view all contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);
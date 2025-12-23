-- Drop existing policies on contacts table
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can create contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete all contacts" ON public.contacts;

-- Create new restrictive RLS policies for contacts
-- Users can only view their own contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only create contacts for themselves
CREATE POLICY "Users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own contacts
CREATE POLICY "Users can update their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own contacts
CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all contacts
CREATE POLICY "Admins can view all contacts" 
ON public.contacts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update all contacts" 
ON public.contacts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete all contacts" 
ON public.contacts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
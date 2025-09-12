-- Fix critical security vulnerability in contact_list_members table
-- Remove overly permissive policy that allows all authenticated users access to all contact list members

-- Drop the dangerous policy that grants universal access
DROP POLICY IF EXISTS "All authenticated users can manage all contact list members" ON public.contact_list_members;

-- Verify we keep only the secure policy that restricts access to contact list owners
-- The remaining policy "Users manage own contact list members" correctly uses:
-- EXISTS (SELECT 1 FROM contact_lists cl WHERE cl.id = contact_list_members.contact_list_id AND cl.user_id = auth.uid())

-- Ensure RLS is enabled on the table
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;

-- Revoke any overly broad grants
REVOKE ALL ON public.contact_list_members FROM public;
REVOKE ALL ON public.contact_list_members FROM anon;

-- Grant only necessary permissions to authenticated users (RLS will handle the rest)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_list_members TO authenticated;
-- Security audit and fix for contacts table
-- Check and ensure no public access policies exist

-- First, let's see all policies that might exist
DO $$
DECLARE
  policy_record RECORD;
  policy_count INTEGER := 0;
BEGIN
  -- Count and display all policies on contacts table
  FOR policy_record IN 
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'contacts' AND schemaname = 'public'
  LOOP
    policy_count := policy_count + 1;
    RAISE NOTICE 'Policy found: % (CMD: %, USING: %, WITH CHECK: %)', 
      policy_record.policyname, 
      policy_record.cmd, 
      policy_record.qual, 
      policy_record.with_check;
  END LOOP;
  
  RAISE NOTICE 'Total policies on contacts table: %', policy_count;
END $$;

-- Drop any potentially dangerous public access policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contacts;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS "Public read access" ON public.contacts;
DROP POLICY IF EXISTS "Allow public access" ON public.contacts;
DROP POLICY IF EXISTS "Enable access for all authenticated users" ON public.contacts;

-- Ensure the secure policy exists and is correctly configured
-- This policy ensures users can only access their own contacts
DO $$
BEGIN
  -- Check if the correct policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND schemaname = 'public' 
    AND policyname = 'Users can manage their own contacts'
    AND qual = '(auth.uid() = user_id)'
  ) THEN
    -- Create the secure policy if it doesn't exist or is misconfigured
    DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
    
    CREATE POLICY "Users can manage their own contacts" 
    ON public.contacts 
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'Secure RLS policy created for contacts table';
  ELSE
    RAISE NOTICE 'Secure RLS policy already exists for contacts table';
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Revoke any public access that might have been granted
REVOKE ALL ON public.contacts FROM public;
REVOKE ALL ON public.contacts FROM anon;

-- Grant only necessary permissions to authenticated users (RLS will handle the rest)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
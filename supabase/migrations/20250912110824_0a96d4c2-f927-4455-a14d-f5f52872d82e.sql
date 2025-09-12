-- Fix user_profiles RLS policies securely
-- 1) Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop any existing overly-permissive policies safely (fixed column name)
DO $$
DECLARE p record;
BEGIN
  FOR p IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', p.policyname);
  END LOOP;
END $$;

-- 3) Create secure policies allowing only user access to own data + admin override
CREATE POLICY "Users can view own profile or admins view all"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Users can insert own profile or admins insert"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Users can update own profile or admins update"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin_user())
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

CREATE POLICY "Users can delete own profile or admins delete"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = user_id OR public.is_admin_user());
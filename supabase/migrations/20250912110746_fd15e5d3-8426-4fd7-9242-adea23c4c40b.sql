-- Secure RLS for user_profiles
-- 1) Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop any existing overly-permissive policies safely
DO $$
DECLARE p record;
BEGIN
  FOR p IN 
    SELECT polname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', p.polname);
  END LOOP;
END $$;

-- 3) Create least-privilege policies with admin override
-- View: owner or admin
CREATE POLICY "Users can view own profile or admins can view all"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin_user());

-- Insert: allow inserting own profile; admins can insert for others
CREATE POLICY "Users can insert own profile or admins"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

-- Update: owner or admin
CREATE POLICY "Users can update own profile or admins"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin_user())
WITH CHECK (auth.uid() = user_id OR public.is_admin_user());

-- Delete: owner or admin (note: general deletes are uncommon; admin function exists)
CREATE POLICY "Users can delete own profile or admins"
ON public.user_profiles
FOR DELETE
USING (auth.uid() = user_id OR public.is_admin_user());

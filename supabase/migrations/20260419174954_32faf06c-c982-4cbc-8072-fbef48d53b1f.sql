-- Remove the permissive blanket SELECT policy on user_profiles
-- so that only the scoped "Users can read own profile or super_admin reads all" policy applies.
DROP POLICY IF EXISTS "Authenticated users can view all user_profiles" ON public.user_profiles;

-- 1. Fix roadshow_stops: replace the vulnerable policy with one using has_role()
DROP POLICY IF EXISTS "Super admin can manage all roadshow stops" ON public.roadshow_stops;

CREATE POLICY "Super admin can manage all roadshow stops"
ON public.roadshow_stops
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Prevent non-admin users from modifying the role column in user_profiles
CREATE OR REPLACE FUNCTION public.protect_user_profile_role()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- If role is being changed, only allow admins/super_admins to do it
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]) THEN
      NEW.role := OLD.role; -- silently revert the role change
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_user_profile_role ON public.user_profiles;
CREATE TRIGGER trigger_protect_user_profile_role
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_profile_role();

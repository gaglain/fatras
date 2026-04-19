-- Prevent privilege escalation: block client-side inserts with elevated roles
CREATE OR REPLACE FUNCTION public.prevent_privileged_profile_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (admin-create-user edge function) to bypass
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block insertion of privileged roles by regular authenticated users
  IF NEW.role IN ('admin', 'super_admin', 'manager') THEN
    RAISE EXCEPTION 'Cannot self-assign privileged role: %', NEW.role
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_privileged_profile_insert ON public.user_profiles;
CREATE TRIGGER trigger_prevent_privileged_profile_insert
BEFORE INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privileged_profile_insert();
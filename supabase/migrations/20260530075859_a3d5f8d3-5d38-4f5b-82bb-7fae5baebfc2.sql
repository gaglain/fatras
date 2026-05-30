
CREATE OR REPLACE FUNCTION public.sync_user_role_to_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role app_role;
  v_role_text text;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Map legacy 'utilisateur' label -> 'user' enum value
  v_role_text := CASE WHEN NEW.role = 'utilisateur' THEN 'user' ELSE NEW.role END;

  BEGIN
    v_role := v_role_text::app_role;
  EXCEPTION WHEN others THEN
    RETURN NEW;
  END;

  DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_user_role ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_role
AFTER INSERT OR UPDATE OF role ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_to_user_roles();

-- Backfill missing user_roles rows from user_profiles
INSERT INTO public.user_roles (user_id, role)
SELECT
  up.user_id,
  (CASE WHEN up.role = 'utilisateur' THEN 'user' ELSE up.role END)::app_role
FROM public.user_profiles up
WHERE up.user_id IS NOT NULL
  AND up.role IN ('super_admin','admin','manager','collaborator','artiste','utilisateur','user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Sécuriser la fonction has_role avec security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- Sécuriser la fonction has_permission avec security definer
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _resource text, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean;
BEGIN
  SELECT 
    CASE lower(_action)
      WHEN 'read' THEN bool_or(rp.can_read)
      WHEN 'create' THEN bool_or(rp.can_create)
      WHEN 'update' THEN bool_or(rp.can_update)
      WHEN 'delete' THEN bool_or(rp.can_delete)
      ELSE false
    END
  INTO result
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = _user_id
    AND (rp.resource = _resource OR rp.resource = '*');

  RETURN COALESCE(result, false);
END;
$$;

-- Fonction helper pour vérifier si l'utilisateur a au moins un des rôles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = ANY(_roles)
  );
$$;
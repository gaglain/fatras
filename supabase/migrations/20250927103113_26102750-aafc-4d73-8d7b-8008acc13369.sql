-- Roles & permissions system
-- 1) Create role enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin','admin','manager','collaborator','artiste','user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3) role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  resource text NOT NULL,
  can_read boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_update boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, resource)
);

-- 4) Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _resource text, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
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
$fn$;

-- 5) Enable RLS and policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Policies for role_permissions
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- 6) Seed default permissions
INSERT INTO public.role_permissions (role, resource, can_read, can_create, can_update, can_delete) VALUES
  ('super_admin','*', true, true, true, true)
ON CONFLICT (role, resource) DO NOTHING;

INSERT INTO public.role_permissions (role, resource, can_read, can_create, can_update, can_delete) VALUES
  ('admin','messaging', true, true, true, true),
  ('manager','messaging', true, true, true, true),
  ('artiste','messaging', true, true, false, false),
  ('user','messaging', true, true, false, false)
ON CONFLICT (role, resource) DO NOTHING;

-- 7) Backfill user_roles from existing user_profiles.role
INSERT INTO public.user_roles (user_id, role)
SELECT up.user_id,
       (CASE 
          WHEN lower(up.role) IN ('super_admin','admin','manager','collaborator','artiste','user') THEN lower(up.role)::public.app_role
          ELSE 'user'::public.app_role
        END)
FROM public.user_profiles up
WHERE up.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

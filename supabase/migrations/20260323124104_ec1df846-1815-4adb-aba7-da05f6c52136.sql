-- Add artiste role to user_roles for all artist users who have auth accounts
INSERT INTO public.user_roles (user_id, role)
SELECT up.user_id, 'user'::app_role
FROM public.user_profiles up
WHERE up.role = 'artiste' 
  AND up.user_id IS NOT NULL
  AND up.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.user_id
  )
ON CONFLICT (user_id, role) DO NOTHING;
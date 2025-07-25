-- Insérer un profil pour l'utilisateur connecté s'il n'existe pas déjà
INSERT INTO public.user_profiles (
  user_id, 
  email, 
  first_name, 
  last_name, 
  username,
  role,
  is_active
)
SELECT 
  '41063595-a26c-4a1d-99ea-657722ec1ea8'::uuid,
  'gaglain.inc@gmail.com',
  'laurent',
  'guillet',
  'gaglain.inc',
  'admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_id = '41063595-a26c-4a1d-99ea-657722ec1ea8'::uuid
);
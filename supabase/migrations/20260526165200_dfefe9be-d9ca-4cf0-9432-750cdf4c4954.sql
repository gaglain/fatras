INSERT INTO public.profiles (id, email, first_name, last_name)
SELECT u.id, u.email,
       COALESCE(u.raw_user_meta_data->>'first_name', ''),
       COALESCE(u.raw_user_meta_data->>'last_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_profiles (
      user_id, email, first_name, last_name, username, role, is_active
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur'),
      true
    );
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

UPDATE public.profiles
SET onboarding_completed_at = NULL
WHERE id = '2c800ee9-9940-4c41-ab40-5e9943f8d665';
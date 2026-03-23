
-- Step 1: Merge data from orphan profiles (user_id IS NULL) into linked profiles (user_id IS NOT NULL)
UPDATE public.user_profiles target
SET
  phone = COALESCE(NULLIF(target.phone, ''), orphan.phone),
  address = COALESCE(NULLIF(target.address, ''), orphan.address),
  city = COALESCE(NULLIF(target.city, ''), orphan.city),
  postal_code = COALESCE(NULLIF(target.postal_code, ''), orphan.postal_code),
  function_title = COALESCE(NULLIF(target.function_title, ''), orphan.function_title),
  show_name = COALESCE(NULLIF(target.show_name, ''), orphan.show_name),
  contracts_fees = COALESCE(target.contracts_fees, orphan.contracts_fees),
  availability = COALESCE(target.availability, orphan.availability),
  skills = CASE WHEN target.skills IS NULL OR array_length(target.skills, 1) IS NULL THEN orphan.skills ELSE target.skills END,
  updated_at = now()
FROM public.user_profiles orphan
WHERE target.email = orphan.email
  AND target.user_id IS NOT NULL
  AND orphan.user_id IS NULL
  AND target.id != orphan.id;

-- Step 2: Delete orphan profiles that have a linked duplicate
DELETE FROM public.user_profiles orphan
USING public.user_profiles linked
WHERE orphan.email = linked.email
  AND orphan.user_id IS NULL
  AND linked.user_id IS NOT NULL
  AND orphan.id != linked.id;

-- Step 3: Fix trigger to prevent future duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  -- Try to link an existing profile (created before signup) by email
  UPDATE public.user_profiles 
  SET 
    user_id = NEW.id,
    first_name = COALESCE(NULLIF(first_name, ''), COALESCE(NEW.raw_user_meta_data->>'first_name', '')),
    last_name = COALESCE(NULLIF(last_name, ''), COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
    updated_at = now()
  WHERE email = NEW.email AND (user_id IS NULL OR user_id = NEW.id);

  -- Only create a new profile if none exists for this email
  IF NOT FOUND THEN
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
  END IF;

  RETURN NEW;
END;
$function$;

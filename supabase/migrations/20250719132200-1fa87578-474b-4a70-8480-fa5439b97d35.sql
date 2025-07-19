-- Fix security warnings by adding search_path to functions

-- Fix function search_path for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$function$;

-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function search_path for handle_new_user_profile
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur')
  );
  RETURN NEW;
END;
$function$;

-- Fix function search_path for update_campaign_stats
CREATE OR REPLACE FUNCTION public.update_campaign_stats(campaign_id uuid, event_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  CASE event_type
    WHEN 'sent' THEN
      UPDATE public.campaigns 
      SET sent_count = COALESCE(sent_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'delivered' THEN
      UPDATE public.campaigns 
      SET delivered_count = COALESCE(delivered_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'opened' THEN
      UPDATE public.campaigns 
      SET opened_count = COALESCE(opened_count, 0) + 1,
          open_rate = CASE 
            WHEN COALESCE(sent_count, 0) > 0 
            THEN ((COALESCE(opened_count, 0) + 1)::NUMERIC / sent_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id;
    WHEN 'clicked' THEN
      UPDATE public.campaigns 
      SET clicked_count = COALESCE(clicked_count, 0) + 1,
          click_rate = CASE 
            WHEN COALESCE(opened_count, 0) > 0 
            THEN ((COALESCE(clicked_count, 0) + 1)::NUMERIC / opened_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id;
    WHEN 'bounced' THEN
      UPDATE public.campaigns 
      SET bounced_count = COALESCE(bounced_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'unsubscribed' THEN
      UPDATE public.campaigns 
      SET unsubscribed_count = COALESCE(unsubscribed_count, 0) + 1
      WHERE id = campaign_id;
  END CASE;
END;
$function$;
-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on public_shop_stats view (it should be a table with RLS)
DROP VIEW IF EXISTS public_shop_stats;

-- Create as a materialized view or table instead with proper RLS
CREATE TABLE public_shop_stats AS
SELECT 
  so.user_id,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE so.status = 'completed') as completed_orders,
  COALESCE(AVG(so.total_amount) FILTER (WHERE so.status = 'completed'), 0) as average_order_value,
  COALESCE(SUM(so.total_amount) FILTER (WHERE so.status = 'completed'), 0) as total_revenue
FROM shop_orders so
GROUP BY so.user_id;

-- Enable RLS on the stats table
ALTER TABLE public_shop_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to restrict access to own stats only
CREATE POLICY "Users can only view their own shop stats" 
ON public_shop_stats 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Fix security definer functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_user_profile_data(profile_user_id uuid, profile_data json)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  UPDATE public.user_profiles 
  SET 
    first_name = COALESCE(profile_data->>'first_name', first_name),
    last_name = COALESCE(profile_data->>'last_name', last_name),
    username = COALESCE(profile_data->>'username', username),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = now()
  WHERE user_id = profile_user_id AND user_id = auth.uid(); -- Additional security check

  IF FOUND THEN
    SELECT json_build_object('success', true, 'updated', true) INTO result;
  ELSE
    SELECT json_build_object('success', false, 'error', 'Profile not found or unauthorized') INTO result;
  END IF;

  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profiles()
 RETURNS TABLE(id uuid, user_id uuid, username text, first_name text, last_name text, email text, phone text, role text, avatar_url text, is_active boolean, address text, city text, function_title text, show_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    up.id,
    up.user_id,
    up.username,
    up.first_name,
    up.last_name,
    up.email,
    up.phone,
    up.role,
    up.avatar_url,
    up.is_active,
    up.address,
    up.city,
    up.function_title,
    up.show_name,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.is_active = true 
  AND (up.user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_profiles admin_check 
    WHERE admin_check.user_id = auth.uid() AND admin_check.role = 'admin'
  ));
$function$;

CREATE OR REPLACE FUNCTION public.update_campaign_stats(campaign_id uuid, event_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify user owns the campaign
  IF NOT EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized access to campaign';
  END IF;

  CASE event_type
    WHEN 'sent' THEN
      UPDATE public.campaigns 
      SET sent_count = COALESCE(sent_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'delivered' THEN
      UPDATE public.campaigns 
      SET delivered_count = COALESCE(delivered_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'opened' THEN
      UPDATE public.campaigns 
      SET opened_count = COALESCE(opened_count, 0) + 1,
          open_rate = CASE 
            WHEN COALESCE(sent_count, 0) > 0 
            THEN ((COALESCE(opened_count, 0) + 1)::NUMERIC / sent_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'clicked' THEN
      UPDATE public.campaigns 
      SET clicked_count = COALESCE(clicked_count, 0) + 1,
          click_rate = CASE 
            WHEN COALESCE(opened_count, 0) > 0 
            THEN ((COALESCE(clicked_count, 0) + 1)::NUMERIC / opened_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'bounced' THEN
      UPDATE public.campaigns 
      SET bounced_count = COALESCE(bounced_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'unsubscribed' THEN
      UPDATE public.campaigns 
      SET unsubscribed_count = COALESCE(unsubscribed_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
  END CASE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_with_profile(user_email text, user_password text, profile_data json)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'User with this email already exists'
    );
  END IF;

  -- Créer le profil utilisateur directement (l'auth sera gérée côté client)
  INSERT INTO public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    username,
    phone,
    role,
    address,
    city,
    function_title,
    show_name,
    is_active
  ) VALUES (
    gen_random_uuid(), -- Générer un UUID temporaire qui sera remplacé par l'auth
    user_email,
    COALESCE(profile_data->>'first_name', ''),
    COALESCE(profile_data->>'last_name', ''),
    COALESCE(profile_data->>'username', split_part(user_email, '@', 1)),
    COALESCE(profile_data->>'phone', ''),
    COALESCE(profile_data->>'role', 'utilisateur'),
    COALESCE(profile_data->>'address', ''),
    COALESCE(profile_data->>'city', ''),
    COALESCE(profile_data->>'function_title', ''),
    COALESCE(profile_data->>'show_name', ''),
    true
  ) RETURNING user_id INTO new_user_id;

  -- Retourner le succès avec l'ID
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_guest_order(customer_email_param text, total_amount_param numeric, shop_owner_id uuid, customer_name_param text DEFAULT NULL::text, customer_address_param jsonb DEFAULT NULL::jsonb, items_param jsonb DEFAULT '[]'::jsonb, currency_param text DEFAULT 'EUR'::text, payment_method_param text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_order_id UUID;
BEGIN
  -- Vérifier que le shop_owner_id existe et est valide
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = shop_owner_id) THEN
    RAISE EXCEPTION 'Shop owner not found';
  END IF;
  
  -- Insérer la commande avec le shop_owner_id comme user_id
  INSERT INTO shop_orders (
    user_id,
    customer_email,
    customer_name,
    customer_address,
    total_amount,
    items,
    currency,
    payment_method,
    status
  ) VALUES (
    shop_owner_id,  -- Assigner la commande au propriétaire de la boutique
    customer_email_param,
    customer_name_param,
    customer_address_param,
    total_amount_param,
    items_param,
    currency_param,
    payment_method_param,
    'pending'
  ) RETURNING id INTO new_order_id;
  
  RETURN new_order_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_guest_order_by_email(order_id_param uuid, customer_email_param text)
 RETURNS TABLE(id uuid, customer_email text, customer_name text, total_amount numeric, currency text, status text, created_at timestamp with time zone, items jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Retourner seulement les informations non-sensibles de la commande
  RETURN QUERY
  SELECT 
    so.id,
    so.customer_email,
    so.customer_name,
    so.total_amount,
    so.currency,
    so.status,
    so.created_at,
    so.items
  FROM shop_orders so
  WHERE so.id = order_id_param 
    AND so.customer_email = customer_email_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_shop_stats()
 RETURNS TABLE(total_orders bigint, completed_orders bigint, average_order_value numeric, total_revenue numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pss.total_orders,
    pss.completed_orders,
    pss.average_order_value,
    pss.total_revenue
  FROM public_shop_stats pss
  WHERE pss.user_id = auth.uid();
END;
$function$;

-- 3. Create a function to refresh shop stats (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_shop_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear existing stats
  DELETE FROM public_shop_stats;
  
  -- Repopulate with current data
  INSERT INTO public_shop_stats
  SELECT 
    so.user_id,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE so.status = 'completed') as completed_orders,
    COALESCE(AVG(so.total_amount) FILTER (WHERE so.status = 'completed'), 0) as average_order_value,
    COALESCE(SUM(so.total_amount) FILTER (WHERE so.status = 'completed'), 0) as total_revenue
  FROM shop_orders so
  GROUP BY so.user_id;
END;
$function$;
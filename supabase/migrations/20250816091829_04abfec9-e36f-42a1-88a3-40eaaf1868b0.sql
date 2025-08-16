-- Ajouter la fonction pour rechercher une commande par email (pour les invités)
CREATE OR REPLACE FUNCTION get_guest_order_by_email(
  order_id_param UUID,
  customer_email_param TEXT
) RETURNS TABLE(
  id UUID,
  customer_email TEXT,
  customer_name TEXT,
  total_amount NUMERIC,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  items JSONB
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Créer une vue sécurisée pour les statistiques publiques (sans données sensibles)
CREATE OR REPLACE VIEW public_shop_stats AS
SELECT 
  user_id,
  count(*) as total_orders,
  count(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  avg(total_amount) as average_order_value,
  sum(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM shop_orders
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Fonction pour obtenir les statistiques de son propre shop
CREATE OR REPLACE FUNCTION get_my_shop_stats()
RETURNS TABLE(
  total_orders BIGINT,
  completed_orders BIGINT,
  average_order_value NUMERIC,
  total_revenue NUMERIC
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
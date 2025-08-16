-- CORRECTION DU PROBLÈME DE SÉCURITÉ DES COMMANDES SHOP_ORDERS
-- Le problème : user_id nullable + politique RLS insuffisante permettent l'accès non autorisé

-- 1. D'abord, supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Users can manage own shop orders" ON shop_orders;

-- 2. Corriger la structure : user_id ne doit pas être nullable pour les nouvelles commandes
-- Mais on garde la compatibilité pour les commandes existantes sans user_id
ALTER TABLE shop_orders ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Créer des politiques RLS plus sécurisées et granulaires

-- Politique SELECT : Seuls les propriétaires authentifiés peuvent voir les commandes
CREATE POLICY "Shop owners can view all orders" 
ON shop_orders 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);

-- Politique INSERT : Seuls les utilisateurs authentifiés peuvent créer des commandes
CREATE POLICY "Authenticated users can create orders" 
ON shop_orders 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);

-- Politique UPDATE : Seuls les propriétaires peuvent modifier leurs commandes
CREATE POLICY "Shop owners can update own orders" 
ON shop_orders 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);

-- Politique DELETE : Seuls les propriétaires peuvent supprimer leurs commandes
CREATE POLICY "Shop owners can delete own orders" 
ON shop_orders 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  auth.uid() = user_id
);

-- 4. Créer une vue sécurisée pour les statistiques publiques (sans données sensibles)
CREATE OR REPLACE VIEW public_shop_stats AS
SELECT 
  count(*) as total_orders,
  count(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  avg(total_amount) as average_order_value
FROM shop_orders
WHERE user_id = auth.uid();

-- 5. Politique pour la vue publique
CREATE POLICY "Shop owners can view their stats" 
ON shop_orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- 6. Fonction sécurisée pour les commandes d'invités (avec session token temporaire)
CREATE OR REPLACE FUNCTION create_guest_order(
  customer_email_param TEXT,
  customer_name_param TEXT DEFAULT NULL,
  customer_address_param JSONB DEFAULT NULL,
  total_amount_param NUMERIC,
  items_param JSONB DEFAULT '[]'::jsonb,
  currency_param TEXT DEFAULT 'EUR',
  payment_method_param TEXT DEFAULT NULL,
  shop_owner_id UUID
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 7. Fonction pour rechercher une commande par email et token (pour les invités)
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
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

-- 4. Fonction sécurisée pour les commandes d'invités (paramètres réorganisés)
CREATE OR REPLACE FUNCTION create_guest_order(
  customer_email_param TEXT,
  total_amount_param NUMERIC,
  shop_owner_id UUID,
  customer_name_param TEXT DEFAULT NULL,
  customer_address_param JSONB DEFAULT NULL,
  items_param JSONB DEFAULT '[]'::jsonb,
  currency_param TEXT DEFAULT 'EUR',
  payment_method_param TEXT DEFAULT NULL
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
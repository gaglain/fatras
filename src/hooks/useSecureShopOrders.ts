import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface ShopOrder {
  id: string;
  customer_email: string;
  customer_name?: string;
  customer_address?: any;
  total_amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  items: Json;
  created_at: string;
  updated_at?: string;
}

export interface CreateOrderData {
  customer_email: string;
  customer_name?: string;
  customer_address?: any;
  total_amount: number;
  items: Json;
  currency?: string;
  payment_method?: string;
}

export interface ShopStats {
  total_orders: number;
  completed_orders: number;
  average_order_value: number;
  total_revenue: number;
}

export const useSecureShopOrders = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les commandes du propriétaire de boutique (utilisateur authentifié)
  const fetchMyOrders = async () => {
    if (!user) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setError('Erreur lors du chargement des commandes');
        toast.error('Erreur lors du chargement des commandes');
      } else {
        setOrders((data || []) as ShopOrder[]);
        setError(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques sécurisées
  const fetchMyStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_my_shop_stats');
      
      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } else {
        // Le résultat est un tableau, prenons le premier élément
        setStats(data?.[0] || {
          total_orders: 0,
          completed_orders: 0,
          average_order_value: 0,
          total_revenue: 0
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Créer une commande d'invité sécurisée
  const createGuestOrder = async (orderData: CreateOrderData): Promise<string | null> => {
    if (!user) {
      toast.error('Le propriétaire de la boutique doit être connecté');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('create_guest_order', {
        customer_email_param: orderData.customer_email,
        total_amount_param: orderData.total_amount,
        shop_owner_id: user.id,
        customer_name_param: orderData.customer_name || null,
        customer_address_param: orderData.customer_address || null,
        items_param: orderData.items,
        currency_param: orderData.currency || 'EUR',
        payment_method_param: orderData.payment_method || null
      });

      if (error) {
        console.error('Erreur lors de la création de la commande:', error);
        toast.error('Erreur lors de la création de la commande');
        return null;
      }

      toast.success('Commande créée avec succès');
      
      // Rafraîchir les données
      await fetchMyOrders();
      await fetchMyStats();
      
      return data;
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la création de la commande');
      return null;
    }
  };

  // Rechercher une commande d'invité par email et ID (fonction publique)
  const getGuestOrderByEmail = async (orderId: string, customerEmail: string): Promise<ShopOrder | null> => {
    try {
      const { data, error } = await supabase.rpc('get_guest_order_by_email', {
        order_id_param: orderId,
        customer_email_param: customerEmail
      });

      if (error) {
        console.error('Erreur lors de la recherche de commande:', error);
        toast.error('Commande non trouvée');
        return null;
      }

      return (data?.[0] as ShopOrder) || null;
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la recherche de commande');
      return null;
    }
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
    if (!user) {
      toast.error('Utilisateur non authentifié');
      return false;
    }

    try {
      const { error } = await supabase
        .from('shop_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        toast.error('Erreur lors de la mise à jour du statut');
        return false;
      }

      toast.success('Statut mis à jour avec succès');
      await fetchMyOrders();
      await fetchMyStats();
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  // Supprimer une commande
  const deleteOrder = async (orderId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Utilisateur non authentifié');
      return false;
    }

    try {
      const { error } = await supabase
        .from('shop_orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      toast.success('Commande supprimée avec succès');
      await fetchMyOrders();
      await fetchMyStats();
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (user) {
      fetchMyOrders();
      fetchMyStats();
    }
  }, [user]);

  return {
    orders,
    stats,
    loading,
    error,
    createGuestOrder,
    getGuestOrderByEmail,
    updateOrderStatus,
    deleteOrder,
    refreshOrders: fetchMyOrders,
    refreshStats: fetchMyStats
  };
};
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      toast.success('Produit créé avec succès');
      return data;
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      toast.error('Erreur lors de la création du produit');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Produit modifié avec succès');
      return data;
    } catch (error: any) {
      console.error('Erreur lors de la modification du produit:', error);
      toast.error('Erreur lors de la modification du produit');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produit supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
      throw error;
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
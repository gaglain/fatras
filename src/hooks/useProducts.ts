import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success('Produit créé avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création du produit:', error);
      toast.error('Erreur lors de la création du produit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: any }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success('Produit modifié avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la modification du produit:', error);
      toast.error('Erreur lors de la modification du produit');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success('Produit supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error('Erreur lors de la suppression du produit');
    },
  });

  return {
    products,
    loading,
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: string, productData: any) => 
      updateMutation.mutateAsync({ id, productData }),
    deleteProduct: deleteMutation.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  };
};

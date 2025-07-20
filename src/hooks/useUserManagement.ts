import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExtendedUserProfile {
  id: string;
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
  address?: string;
  city?: string;
  function_title?: string;
  show_name?: string;
  created_at: string;
  updated_at: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_profiles');
      
      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    username?: string;
    phone?: string;
    role?: string;
    address?: string;
    city?: string;
    function_title?: string;
    show_name?: string;
  }) => {
    try {
      setLoading(true);
      
      // Créer l'utilisateur avec auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        toast.error('Erreur lors de la création du compte');
        return false;
      }

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            username: userData.username || userData.email.split('@')[0],
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'utilisateur',
            address: userData.address,
            city: userData.city,
            function_title: userData.function_title,
            show_name: userData.show_name,
            is_active: true
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          toast.error('Erreur lors de la création du profil');
          return false;
        }

        toast.success('Utilisateur créé avec succès');
        await fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const updateUserProfile = async (userId: string, userData: Partial<ExtendedUserProfile>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('update_user_profile_data', {
        profile_user_id: userId,
        profile_data: userData
      });

      if (error) {
        console.error('Erreur mise à jour:', error);
        toast.error('Erreur lors de la mise à jour');
        return false;
      }

      toast.success('Profil mis à jour avec succès');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur désactivation:', error);
        toast.error('Erreur lors de la désactivation');
        return false;
      }

      toast.success('Utilisateur désactivé');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la désactivation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUserProfile,
    deactivateUser
  };
};
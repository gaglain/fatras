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
  birth_date?: string;
  birth_place?: string;
  social_security_number?: string;
  guso_id?: string;
  nationality?: string;
  bank_details?: any;
  contracts_fees?: any[];
  availability?: any;
  skills?: string[];
  identity_documents?: any[];
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

      setUsers((data || []) as ExtendedUserProfile[]);
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
    birth_date?: string;
    birth_place?: string;
    social_security_number?: string;
    guso_id?: string;
    nationality?: string;
    bank_details?: any;
    contracts_fees?: any[];
    availability?: any;
    skills?: string[];
    identity_documents?: any[];
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
            birth_date: userData.birth_date,
            birth_place: userData.birth_place,
            social_security_number: userData.social_security_number,
            guso_id: userData.guso_id,
            nationality: userData.nationality,
            bank_details: userData.bank_details,
            contracts_fees: userData.contracts_fees || [],
            availability: userData.availability,
            skills: userData.skills || [],
            identity_documents: userData.identity_documents || [],
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
      
      // Mise à jour directe de la table user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          phone: userData.phone,
          role: userData.role, // Assurer que le rôle est bien mis à jour
          address: userData.address,
          city: userData.city,
          function_title: userData.function_title,
          show_name: userData.show_name,
          avatar_url: userData.avatar_url,
          birth_date: userData.birth_date,
          birth_place: userData.birth_place,
          social_security_number: userData.social_security_number,
          guso_id: userData.guso_id,
          nationality: userData.nationality,
          bank_details: userData.bank_details,
          contracts_fees: userData.contracts_fees,
          availability: userData.availability,
          skills: userData.skills,
          identity_documents: userData.identity_documents,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

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
      console.log('🗑️ Suppression utilisateur:', userId);
      
      // Utiliser la fonction de suppression sécurisée
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userId
      });

      if (error) {
        console.error('❌ Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        console.error('❌ Erreur suppression:', data.error);
        toast.error(String(data.error || 'Erreur inconnue'));
        return false;
      }

      // Mettre à jour immédiatement la liste locale
      setUsers(prev => prev.filter(user => user.user_id !== userId));
      console.log('✅ Utilisateur supprimé avec succès');
      toast.success('Utilisateur supprimé définitivement');
      await fetchUsers(); // Recharger la liste
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
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
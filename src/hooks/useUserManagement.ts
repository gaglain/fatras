import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNylasEmail } from './useNylasEmail';
import { useEmailSender } from './useEmailSender';
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
  entertainment_leave_number?: string;
  tax_reduction?: boolean;
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
  const { accounts, sendEmail: sendEmailViaNylas } = useNylasEmail();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
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
    entertainment_leave_number?: string;
    tax_reduction?: boolean;
    bank_details?: any;
    contracts_fees?: any[];
    availability?: any;
    skills?: string[];
    identity_documents?: any[];
  }) => {
    try {
      setLoading(true);
      console.log('🔄 Création utilisateur avec les données:', {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      });
      
      // Utiliser la fonction de base de données pour créer l'utilisateur directement
      const { data, error } = await supabase.rpc('create_user_with_profile', {
        user_email: userData.email,
        user_password: userData.password,
        profile_data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username || userData.email.split('@')[0],
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
          entertainment_leave_number: userData.entertainment_leave_number,
          tax_reduction: userData.tax_reduction,
          bank_details: userData.bank_details,
          contracts_fees: userData.contracts_fees || [],
          availability: userData.availability,
          skills: userData.skills || [],
          identity_documents: userData.identity_documents || []
        }
      });

      console.log('📊 Résultat create_user_with_profile:', data);

      if (error) {
        console.error('❌ Erreur RPC create_user_with_profile:', error);
        toast.error(`Erreur lors de la création: ${error.message}`);
        return false;
      }

      const result = data as { success: boolean; error?: string; user_id?: string; email?: string };
      if (!result?.success) {
        console.error('❌ Échec création:', result?.error);
        toast.error(`Erreur: ${result?.error}`);
        return false;
      }

      console.log('✅ Profil utilisateur créé dans la base:', result);

      // Si la RPC a déjà créé l'utilisateur Auth, on évite l'appel Edge Function
      let authUserId: string | undefined = result?.user_id as string | undefined;

      if (!authUserId) {
        // Création via l'Edge Function admin (email confirmé)
        const { data: createData, error: createError } = await supabase.functions.invoke('admin-create-user', {
          body: {
            action: 'create',
            email: userData.email,
            password: userData.password,
            metadata: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username || userData.email.split('@')[0],
              role: userData.role || 'utilisateur'
            }
          }
        });

        if (createError || !createData?.success) {
          console.error('❌ Erreur création utilisateur (admin):', createError || createData?.error);
          toast.error(`Erreur création auth: ${createError?.message || createData?.error || 'inconnue'}`);
        }

        authUserId = createData?.user?.id as string | undefined;
      }

      if (authUserId) {
        console.log('🔄 Mise à jour du profil avec user_id auth:', authUserId);
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ user_id: authUserId })
          .eq('email', userData.email);
        if (updateError) {
          console.error('❌ Erreur mise à jour user_id:', updateError);
        } else {
          console.log('✅ Profil mis à jour avec user_id auth');
        }
      }

      // Envoyer l'email de bienvenue via Nylas
      try {
        if (accounts.length > 0) {
          const activeAccount = accounts.find(acc => acc.is_active) || accounts[0];
          
          await sendEmailViaNylas(activeAccount.id, {
            to: userData.email,
            subject: 'Bienvenue - Votre accès a été créé',
            content: `Bonjour ${userData.first_name} ${userData.last_name},

Votre compte a été créé avec succès !

Voici vos informations de connexion :
- Email : ${userData.email}
- Mot de passe temporaire : ${userData.password}

Veuillez vous connecter et changer votre mot de passe lors de votre première connexion.

Cordialement,
L'équipe`,
            html: `
              <h2>Bienvenue ${userData.first_name} ${userData.last_name} !</h2>
              <p>Votre compte a été créé avec succès.</p>
              <h3>Informations de connexion :</h3>
              <ul>
                <li><strong>Email :</strong> ${userData.email}</li>
                <li><strong>Mot de passe temporaire :</strong> <code>${userData.password}</code></li>
              </ul>
              <p>Veuillez vous connecter et changer votre mot de passe lors de votre première connexion.</p>
              <p>Cordialement,<br>L'équipe</p>
            `
          });
          console.log('✅ Email de bienvenue envoyé via Nylas');
        } else {
          console.warn('⚠️ Aucun compte Nylas configuré pour l\'envoi d\'emails');
          toast.error('Utilisateur créé mais aucun compte email configuré');
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email via Nylas:', emailError);
        toast.error('Utilisateur créé mais erreur envoi email');
      }

      toast.success('Utilisateur créé avec succès !');
      await fetchUsers(); // Recharger la liste
      return true;

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
      return false;
    } finally {
      setLoading(false);
    }
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
          birth_date: userData.birth_date || null,
          birth_place: userData.birth_place,
          social_security_number: userData.social_security_number,
          guso_id: userData.guso_id,
          nationality: userData.nationality,
          entertainment_leave_number: userData.entertainment_leave_number,
          tax_reduction: userData.tax_reduction,
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

  const deleteUser = deactivateUser; // Alias pour compatibilité

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUserProfile,
    deactivateUser,
    deleteUser
  };
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNylasEmail } from './useNylasEmail';
import { useEmailSender } from './useEmailSender';
export interface ExtendedUserProfile {
  id: string;
  user_id: string | null;
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
  const { sendUserWelcomeEmail } = useEmailSender();

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
  }): Promise<{ success: boolean; authCreated: boolean; profileCreated: boolean; emailSent: boolean; errors: string[] }> => {
    const result = {
      success: false,
      authCreated: false,
      profileCreated: false,
      emailSent: false,
      errors: [] as string[]
    };

    try {
      setLoading(true);
      console.log('🔄 Création utilisateur:', { email: userData.email, role: userData.role });

      // ÉTAPE 1: Créer le compte Auth via Edge Function d'abord
      console.log('📍 Étape 1: Création du compte Auth...');
      let authUserId: string | undefined;
      
      try {
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

        console.log('📊 Réponse admin-create-user:', createData);

        if (createError) {
          console.error('❌ Erreur Edge Function:', createError);
          result.errors.push(`Erreur création auth: ${createError.message}`);
        } else if (!createData?.success) {
          console.error('❌ Échec création auth:', createData?.error);
          result.errors.push(`Échec création auth: ${createData?.error || 'erreur inconnue'}`);
        } else {
          authUserId = createData?.user?.id;
          result.authCreated = true;
          console.log('✅ Compte Auth créé:', authUserId);
        }
      } catch (authError: any) {
        console.error('❌ Exception création auth:', authError);
        result.errors.push(`Exception auth: ${authError?.message || 'erreur inconnue'}`);
      }

      // ÉTAPE 2: Créer ou mettre à jour le profil
      console.log('📍 Étape 2: Création/mise à jour du profil...');
      
      try {
        // Vérifier si un profil existe déjà pour cet email
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id, user_id')
          .eq('email', userData.email)
          .maybeSingle();

        if (existingProfile) {
          // Mettre à jour le profil existant
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              user_id: authUserId || existingProfile.user_id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username || userData.email.split('@')[0],
              phone: userData.phone,
              role: userData.role || 'utilisateur',
              address: userData.address,
              city: userData.city,
              function_title: userData.function_title,
              show_name: userData.show_name,
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id);

          if (updateError) {
            console.error('❌ Erreur mise à jour profil:', updateError);
            result.errors.push(`Erreur mise à jour profil: ${updateError.message}`);
          } else {
            result.profileCreated = true;
            console.log('✅ Profil mis à jour');
          }
        } else {
          // Créer un nouveau profil
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: authUserId,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username || userData.email.split('@')[0],
              phone: userData.phone,
              role: userData.role || 'utilisateur',
              address: userData.address,
              city: userData.city,
              function_title: userData.function_title,
              show_name: userData.show_name,
              is_active: true
            });

          if (insertError) {
            console.error('❌ Erreur création profil:', insertError);
            result.errors.push(`Erreur création profil: ${insertError.message}`);
          } else {
            result.profileCreated = true;
            console.log('✅ Profil créé');
          }
        }
      } catch (profileError: any) {
        console.error('❌ Exception profil:', profileError);
        result.errors.push(`Exception profil: ${profileError?.message || 'erreur inconnue'}`);
      }

      // ÉTAPE 3: Envoyer l'email de bienvenue (seulement si auth créé)
      if (result.authCreated) {
        console.log('📍 Étape 3: Envoi email de bienvenue...');
        
        try {
          let emailSent = false;
          
          if (accounts.length > 0) {
            try {
              const activeAccount = accounts.find(acc => acc.is_active) || accounts[0];
              
              await sendEmailViaNylas(activeAccount.id, {
                to: userData.email,
                subject: 'Bienvenue - Votre accès a été créé',
                content: `Bonjour ${userData.first_name} ${userData.last_name},\n\nVotre compte a été créé.\n\nIdentifiants:\n- Email: ${userData.email}\n- Mot de passe: ${userData.password}\n\nCordialement`,
                html: `<h2>Bienvenue ${userData.first_name} ${userData.last_name}!</h2><p>Votre compte a été créé.</p><p><strong>Email:</strong> ${userData.email}<br><strong>Mot de passe:</strong> <code>${userData.password}</code></p>`
              });
              emailSent = true;
              console.log('✅ Email envoyé via Nylas');
            } catch (nylasError) {
              console.warn('⚠️ Échec Nylas, tentative Resend...');
            }
          }
          
          if (!emailSent) {
            await sendUserWelcomeEmail(userData.email, `${userData.first_name} ${userData.last_name}`, userData.password);
            emailSent = true;
            console.log('✅ Email envoyé via Resend');
          }
          
          result.emailSent = emailSent;
        } catch (emailError: any) {
          console.error('❌ Erreur envoi email:', emailError);
          result.errors.push(`Erreur email: ${emailError?.message || 'envoi échoué'}`);
        }
      } else {
        result.errors.push('Email non envoyé car le compte auth n\'a pas été créé');
      }

      // Résultat final
      result.success = result.authCreated && result.profileCreated;

      // Afficher le résumé
      if (result.success) {
        if (result.emailSent) {
          toast.success('✅ Utilisateur créé et email envoyé !');
        } else {
          toast.warning('⚠️ Utilisateur créé mais email non envoyé');
        }
      } else {
        const errorSummary = result.errors.join(' | ');
        if (result.profileCreated && !result.authCreated) {
          toast.error(`❌ Profil créé mais compte auth échoué: ${errorSummary}`);
        } else if (result.authCreated && !result.profileCreated) {
          toast.error(`❌ Auth créé mais profil échoué: ${errorSummary}`);
        } else {
          toast.error(`❌ Création échouée: ${errorSummary}`);
        }
      }

      console.log('📊 Résultat création:', result);
      await fetchUsers();
      return result;

    } catch (error: any) {
      console.error('❌ Erreur générale:', error);
      result.errors.push(`Erreur générale: ${error?.message || 'inconnue'}`);
      toast.error('Erreur lors de la création de l\'utilisateur');
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réessayer la création auth pour un profil existant sans user_id
  const retryAuthCreation = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔄 Réessai création auth pour:', email);

      const { data: createData, error: createError } = await supabase.functions.invoke('admin-create-user', {
        body: { email, password }
      });

      if (createError || !createData?.success) {
        console.error('❌ Échec réessai:', createError || createData?.error);
        toast.error(`Échec: ${createError?.message || createData?.error}`);
        return false;
      }

      const authUserId = createData?.user?.id;
      if (authUserId) {
        await supabase
          .from('user_profiles')
          .update({ user_id: authUserId })
          .eq('email', email);
        
        toast.success('✅ Compte auth créé et lié !');
        await fetchUsers();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Erreur réessai:', error);
      toast.error(`Erreur: ${error?.message}`);
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

      const target = users.find(u => u.user_id === userId || u.id === userId);
      const email = target?.email;

      // 1) Supprimer aussi l'utilisateur dans Supabase Auth (si existant)
      if (email) {
        const { data: delAuthData, error: delAuthError } = await supabase.functions.invoke('admin-delete-user', {
          body: { userId, email },
        });

        if (delAuthError) {
          console.error('❌ Erreur suppression Auth:', delAuthError);
          toast.error(`Erreur suppression Auth: ${delAuthError.message}`);
          return false;
        }

        if (delAuthData?.success === false) {
          console.error('❌ Échec suppression Auth:', delAuthData?.error);
          toast.error(`Erreur suppression Auth: ${delAuthData?.error || 'inconnue'}`);
          return false;
        }

        if (delAuthData?.deletedAuth) {
          console.log('✅ Utilisateur supprimé dans Auth');
        } else {
          console.log('ℹ️ Aucun utilisateur Auth trouvé (probablement profil sans compte)');
        }
      }

      // 2) Supprimer le profil applicatif (table public.user_profiles)
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userId,
      });

      if (error) {
        console.error('❌ Erreur suppression profil:', error);
        toast.error('Erreur lors de la suppression du profil');
        return false;
      }

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        console.error('❌ Erreur suppression profil:', data.error);
        toast.error(String(data.error || 'Erreur inconnue'));
        return false;
      }

      // Mettre à jour immédiatement la liste locale
      setUsers(prev => prev.filter(user => user.user_id !== userId && user.id !== userId));
      console.log('✅ Utilisateur supprimé avec succès');
      toast.success('Utilisateur supprimé définitivement');
      await fetchUsers();
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
    deleteUser,
    retryAuthCreation
  };
};
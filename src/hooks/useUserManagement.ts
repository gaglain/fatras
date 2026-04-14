import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNylasEmail } from './useNylasEmail';
import { useEmailSender } from './useEmailSender';
import { logger } from '@/lib/logger';
import { createUserAuth, upsertUserProfile, updateProfileFields, deleteUserCompletely } from './useUserManagementOperations';

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
      const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (error) { logger.error('Erreur chargement utilisateurs:', error); toast.error('Erreur chargement utilisateurs'); return; }
      setUsers((data || []) as ExtendedUserProfile[]);
    } catch (error) { logger.error('Erreur:', error); toast.error('Erreur chargement utilisateurs'); } finally { setLoading(false); }
  };

  const createUser = async (userData: any): Promise<{ success: boolean; authCreated: boolean; profileCreated: boolean; emailSent: boolean; errors: string[] }> => {
    const result = { success: false, authCreated: false, profileCreated: false, emailSent: false, errors: [] as string[] };
    try {
      setLoading(true);

      // Step 1: Auth
      let authUserId: string | undefined;
      try { authUserId = await createUserAuth(userData); result.authCreated = true; }
      catch (e: any) { result.errors.push(`Auth: ${e.message}`); }

      // Step 2: Profile
      try { await upsertUserProfile(authUserId, userData); result.profileCreated = true; }
      catch (e: any) { result.errors.push(`Profil: ${e.message}`); }

      // Step 3: Welcome email
      if (result.authCreated) {
        try {
          let emailSent = false;
          if (accounts.length > 0) {
            try {
              const activeAccount = accounts.find(a => a.is_active) || accounts[0];
              await sendEmailViaNylas(activeAccount.id, {
                to: userData.email, subject: 'Bienvenue - Votre accès a été créé',
                content: `Bonjour ${userData.first_name},\nCompte créé.\nEmail: ${userData.email}\nMot de passe: ${userData.password}`,
                html: `<h2>Bienvenue ${userData.first_name}!</h2><p>Email: ${userData.email}<br>Mot de passe: <code>${userData.password}</code></p>`
              });
              emailSent = true;
            } catch { logger.warn('Nylas failed, trying Resend...'); }
          }
          if (!emailSent) { await sendUserWelcomeEmail(userData.email, `${userData.first_name} ${userData.last_name}`, userData.password); emailSent = true; }
          result.emailSent = emailSent;
        } catch (e: any) { result.errors.push(`Email: ${e.message}`); }
      }

      result.success = result.authCreated && result.profileCreated;
      if (result.success) { toast.success(result.emailSent ? '✅ Utilisateur créé et email envoyé !' : '⚠️ Utilisateur créé mais email non envoyé'); }
      else { toast.error(`❌ Création échouée: ${result.errors.join(' | ')}`); }
      await fetchUsers();
      return result;
    } catch (e: any) { result.errors.push(e.message); toast.error('Erreur création utilisateur'); return result; } finally { setLoading(false); }
  };

  const retryAuthCreation = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-create-user', { body: { email, password } });
      if (error || !data?.success) { toast.error(`Échec: ${error?.message || data?.error}`); return false; }
      if (data?.user?.id) { await supabase.from('user_profiles').update({ user_id: data.user.id }).eq('email', email); toast.success('✅ Compte auth créé !'); await fetchUsers(); return true; }
      return false;
    } catch (e: any) { toast.error(`Erreur: ${e.message}`); return false; } finally { setLoading(false); }
  };

  const updateUserProfile = async (userId: string, userData: Partial<ExtendedUserProfile>) => {
    try { setLoading(true); await updateProfileFields(userId, userData); toast.success('Profil mis à jour'); await fetchUsers(); return true; }
    catch { toast.error('Erreur mise à jour'); return false; } finally { setLoading(false); }
  };

  const deactivateUser = async (userId: string) => {
    try {
      setLoading(true);
      const target = users.find(u => u.user_id === userId || u.id === userId);
      await deleteUserCompletely(userId, target?.email);
      setUsers(prev => prev.filter(u => u.user_id !== userId && u.id !== userId));
      toast.success('Utilisateur supprimé'); await fetchUsers(); return true;
    } catch (e: any) { toast.error(`Erreur suppression: ${e.message}`); return false; } finally { setLoading(false); }
  };

  return { users, loading, fetchUsers, createUser, updateUserProfile, deactivateUser, deleteUser: deactivateUser, retryAuthCreation };
};

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { ExtendedUserProfile } from './useUserManagement';

export async function createUserAuth(userData: { email: string; password: string; first_name: string; last_name: string; username?: string; role?: string }) {
  const { data: createData, error: createError } = await supabase.functions.invoke('admin-create-user', {
    body: {
      action: 'create', email: userData.email, password: userData.password,
      metadata: { first_name: userData.first_name, last_name: userData.last_name, username: userData.username || userData.email.split('@')[0], role: userData.role || 'utilisateur' }
    }
  });
  if (createError) throw new Error(createError.message);
  if (!createData?.success) throw new Error(createData?.error || 'erreur inconnue');
  return createData?.user?.id as string | undefined;
}

export async function upsertUserProfile(authUserId: string | undefined, userData: any) {
  const { data: existing } = await supabase.from('user_profiles').select('id, user_id').eq('email', userData.email).maybeSingle();
  
  const profileData = {
    user_id: authUserId || existing?.user_id, first_name: userData.first_name, last_name: userData.last_name,
    username: userData.username || userData.email.split('@')[0], phone: userData.phone, role: userData.role || 'utilisateur',
    address: userData.address, city: userData.city, function_title: userData.function_title, show_name: userData.show_name,
    is_active: true, updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from('user_profiles').update(profileData).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_profiles').insert({ ...profileData, email: userData.email });
    if (error) throw error;
  }
}

export async function updateProfileFields(userId: string, userData: Partial<ExtendedUserProfile>) {
  const { error } = await supabase.from('user_profiles').update({
    first_name: userData.first_name, last_name: userData.last_name, username: userData.username,
    phone: userData.phone, role: userData.role, address: userData.address, city: userData.city,
    function_title: userData.function_title, show_name: userData.show_name, avatar_url: userData.avatar_url,
    birth_date: userData.birth_date || null, birth_place: userData.birth_place,
    social_security_number: userData.social_security_number, guso_id: userData.guso_id,
    nationality: userData.nationality, entertainment_leave_number: userData.entertainment_leave_number,
    tax_reduction: userData.tax_reduction, bank_details: userData.bank_details,
    contracts_fees: userData.contracts_fees, availability: userData.availability,
    skills: userData.skills, identity_documents: userData.identity_documents,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (error) throw error;
}

export async function deleteUserCompletely(userId: string, email?: string) {
  if (email) {
    const { data: delAuthData, error: delAuthError } = await supabase.functions.invoke('admin-delete-user', { body: { userId, email } });
    if (delAuthError) throw new Error(delAuthError.message);
    if (delAuthData?.success === false) throw new Error(delAuthData?.error || 'inconnue');
  }
  const { data, error } = await supabase.rpc('delete_user_completely', { target_user_id: userId });
  if (error) throw error;
  if (data && typeof data === 'object' && 'success' in data && !data.success) throw new Error(String(data.error || 'Erreur inconnue'));
}

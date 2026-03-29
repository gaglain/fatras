import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { notifyContactAssignment } from '@/utils/notificationHelpers';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type DbContact = Database['public']['Tables']['contacts']['Row'];

export interface Contact {
  id: string;
  user_id: string;
  external_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status: string;
  source?: string;
  notes?: string;
  tags?: string[];
  role?: string;
  event_id?: string;
  event_type_id?: string;
  accepts_marketing_emails: boolean;
  lead_score: number;
  created_at: string;
  updated_at: string;
}

// Helper to map DB data to Contact type
const mapDbToContact = (data: DbContact): Contact => ({
  id: data.id,
  user_id: data.user_id,
  external_id: data.external_id || '',
  first_name: data.first_name,
  last_name: data.last_name,
  email: data.email || '',
  phone: data.phone || '',
  position: data.position || '',
  address: data.address || '',
  city: data.city || '',
  postal_code: data.postal_code || '',
  country: data.country || '',
  status: data.status || 'prospect',
  source: data.source || '',
  notes: data.notes || '',
  tags: data.tags || [],
  role: data.role || '',
  event_id: data.event_id || '',
  event_type_id: data.event_type_id || '',
  accepts_marketing_emails: data.accepts_marketing_emails ?? true,
  lead_score: data.lead_score || 0,
  created_at: data.created_at,
  updated_at: data.updated_at
});

// Fetch contacts from Supabase
const fetchContacts = async (): Promise<Contact[]> => {
  // Paginated fetch to bypass the 1000-row default limit
  const PAGE_SIZE = 1000;
  let allData: DbContact[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      logger.error('Error fetching contacts:', error);
      throw error;
    }

    allData = [...allData, ...(data || [])];
    hasMore = (data || []).length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return allData.map(mapDbToContact);
};

export const useContacts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Query for fetching contacts
  const { 
    data: contacts = [], 
    isLoading: loading,
    refetch 
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Check for duplicate email
  const checkDuplicateEmail = async (email: string, excludeId?: string): Promise<Contact | null> => {
    if (!email || !email.trim()) return null;
    
    let query = supabase
      .from('contacts')
      .select('*')
      .ilike('email', email.trim());
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data } = await query.maybeSingle();
    return data ? mapDbToContact(data) : null;
  };

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
      // Check for duplicate email first
      if (contactData.email) {
        const existingContact = await checkDuplicateEmail(contactData.email);
        if (existingContact) {
          return { contact: null, isDuplicate: true, existingContact };
        }
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: contactData.user_id,
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          email: contactData.email,
          phone: contactData.phone,
          position: contactData.position,
          address: contactData.address,
          city: contactData.city,
          postal_code: contactData.postal_code,
          country: contactData.country,
          status: contactData.status,
          source: contactData.source,
          notes: contactData.notes,
          tags: contactData.tags,
          role: contactData.role,
          event_id: contactData.event_id,
          event_type_id: contactData.event_type_id,
          accepts_marketing_emails: contactData.accepts_marketing_emails,
          lead_score: contactData.lead_score
        })
        .select()
        .single();

      if (error) throw error;
      
      const newContact = mapDbToContact(data);

      // Notify if assigned to someone else
      if (contactData.user_id && user && contactData.user_id !== user.id) {
        const contactName = `${contactData.first_name} ${contactData.last_name}`.trim();
        
        const { data: assignerData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (assignerData?.email) {
          await notifyContactAssignment({
            assignedToUserId: contactData.user_id,
            contactName,
            assignedByUserEmail: assignerData.email,
            contactId: data.id
          });
        }
      }

      return { contact: newContact, isDuplicate: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, updates, oldContact }: { id: string; updates: Partial<Contact>; oldContact?: Contact }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          email: updates.email,
          phone: updates.phone,
          position: updates.position,
          address: updates.address,
          city: updates.city,
          postal_code: updates.postal_code,
          country: updates.country,
          status: updates.status,
          source: updates.source,
          notes: updates.notes,
          tags: updates.tags,
          role: updates.role,
          event_id: updates.event_id,
          event_type_id: updates.event_type_id,
          accepts_marketing_emails: updates.accepts_marketing_emails,
          lead_score: updates.lead_score,
          user_id: updates.user_id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Notify if user_id changed
      if (updates.user_id && oldContact?.user_id !== updates.user_id && user) {
        const contactName = `${updates.first_name || oldContact?.first_name} ${updates.last_name || oldContact?.last_name}`.trim();
        
        const { data: assignerData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (assignerData?.email) {
          await notifyContactAssignment({
            assignedToUserId: updates.user_id,
            contactName,
            assignedByUserEmail: assignerData.email,
            contactId: id
          });
        }
      }

      return mapDbToContact(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  // Wrapper functions for backward compatibility
  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    return addContactMutation.mutateAsync(contactData);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const oldContact = contacts.find(c => c.id === id);
    return updateContactMutation.mutateAsync({ id, updates, oldContact });
  };

  const deleteContact = async (id: string) => {
    return deleteContactMutation.mutateAsync(id);
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    checkDuplicateEmail,
    refetch
  };
};

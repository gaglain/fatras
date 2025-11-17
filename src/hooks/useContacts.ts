import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { notifyContactAssignment } from '@/utils/notificationHelpers';

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

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const contactsData: Contact[] = data.map(contact => ({
          id: contact.id,
          user_id: contact.user_id,
          external_id: contact.external_id || '',
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email || '',
          phone: contact.phone || '',
          position: contact.position || '',
          address: contact.address || '',
          city: contact.city || '',
          postal_code: contact.postal_code || '',
          country: contact.country || '',
          status: contact.status || 'prospect',
          source: contact.source || '',
          notes: contact.notes || '',
          tags: contact.tags || [],
          role: contact.role || '',
          event_id: contact.event_id || '',
          event_type_id: contact.event_type_id || '',
          accepts_marketing_emails: contact.accepts_marketing_emails ?? true,
          lead_score: contact.lead_score || 0,
          created_at: contact.created_at,
          updated_at: contact.updated_at
        }));
        setContacts(contactsData);
      }
      setLoading(false);
    };

    fetchContacts();
  }, [user]);

  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
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

    if (data && !error) {
      const newContact: Contact = {
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
      };
      setContacts(prev => [...prev, newContact]);

      // Si un user_id est assigné, envoyer une notification
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

      return newContact;
    }
    return null;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    // Récupérer l'ancien contact pour comparer user_id
    const oldContact = contacts.find(c => c.id === id);
    
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

    if (data && !error) {
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...updates } : contact
      ));

      // Si user_id a changé, envoyer une notification
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
    }
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      setContacts(prev => prev.filter(contact => contact.id !== id));
    }
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  contactCount?: number;
}

export interface ContactListMember {
  id: string;
  contact_list_id: string;
  contact_id: string;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  city?: string;
  postal_code?: string;
  status?: string;
  tags?: string[];
  accepts_marketing_emails?: boolean;
}

export const useContactLists = () => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContactLists = async () => {
    try {
      const { data: lists, error } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_members (
            contact_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count contacts for each list
      const listsWithCount = lists?.map(list => ({
        ...list,
        contactCount: list.contact_list_members?.length || 0
      })) || [];

      setContactLists(listsWithCount);
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les listes de contacts",
        variant: "destructive"
      });
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, phone, company, position, city, postal_code, status, tags, accepts_marketing_emails')
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive"
      });
    }
  };

  const createContactList = async (listData: {
    name: string;
    description?: string;
    contactIds: string[];
  }) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the contact list
      const { data: newList, error: listError } = await supabase
        .from('contact_lists')
        .insert({
          name: listData.name,
          description: listData.description,
          user_id: user.id
        })
        .select()
        .single();

      if (listError) throw listError;

      // Add contacts to the list
      if (listData.contactIds.length > 0) {
        const members = listData.contactIds.map(contactId => ({
          contact_list_id: newList.id,
          contact_id: contactId
        }));

        const { error: membersError } = await supabase
          .from('contact_list_members')
          .insert(members);

        if (membersError) throw membersError;
      }

      await fetchContactLists();
      toast({
        title: "Succès",
        description: "Liste de contacts créée avec succès"
      });

      return newList;
    } catch (error) {
      console.error('Error creating contact list:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la liste de contacts",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContactList = async (
    listId: string,
    updates: {
      name?: string;
      description?: string;
      contactIds?: string[];
    }
  ) => {
    try {
      // Update list details
      if (updates.name !== undefined || updates.description !== undefined) {
        const { error: updateError } = await supabase
          .from('contact_lists')
          .update({
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.description !== undefined && { description: updates.description })
          })
          .eq('id', listId);

        if (updateError) throw updateError;
      }

      // Update contacts if provided
      if (updates.contactIds !== undefined) {
        // Remove existing members
        const { error: deleteError } = await supabase
          .from('contact_list_members')
          .delete()
          .eq('contact_list_id', listId);

        if (deleteError) throw deleteError;

        // Add new members
        if (updates.contactIds.length > 0) {
          const members = updates.contactIds.map(contactId => ({
            contact_list_id: listId,
            contact_id: contactId
          }));

          const { error: insertError } = await supabase
            .from('contact_list_members')
            .insert(members);

          if (insertError) throw insertError;
        }
      }

      await fetchContactLists();
      toast({
        title: "Succès",
        description: "Liste de contacts mise à jour"
      });
    } catch (error) {
      console.error('Error updating contact list:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la liste",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteContactList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      await fetchContactLists();
      toast({
        title: "Succès",
        description: "Liste de contacts supprimée"
      });
    } catch (error) {
      console.error('Error deleting contact list:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la liste",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getContactsInList = async (listId: string): Promise<Contact[]> => {
    try {
      const { data, error } = await supabase
        .from('contact_list_members')
        .select(`
          contacts (
            id,
            first_name,
            last_name,
            email,
            accepts_marketing_emails
          )
        `)
        .eq('contact_list_id', listId);

      if (error) throw error;

      return data?.map(member => member.contacts).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching contacts in list:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContactLists(), fetchContacts()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    contactLists,
    contacts,
    loading,
    createContactList,
    updateContactList,
    deleteContactList,
    getContactsInList,
    refetch: () => Promise.all([fetchContactLists(), fetchContacts()])
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  artist_id?: string;
  event_id?: string;
  is_exclusion?: boolean;
  centralized_artists?: {
    id: string;
    name: string;
  };
  events?: {
    id: string;
    title: string;
  };
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

const fetchContactLists = async (): Promise<ContactList[]> => {
  const { data: lists, error } = await supabase
    .from('contact_lists')
    .select(`
      *,
      contact_list_members (
        contact_id
      ),
      centralized_artists (
        id,
        name
      ),
      events (
        id,
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (lists || []).map(list => ({
    ...list,
    contactCount: list.contact_list_members?.length || 0
  }));
};

const fetchContactsForLists = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, company, position, city, postal_code, status, tags, accepts_marketing_emails')
    .order('first_name');

  if (error) throw error;
  return data || [];
};

export const useContactLists = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const {
    data: contactLists = [],
    isLoading: listsLoading,
  } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: fetchContactLists,
    enabled: !!user,
    staleTime: 60_000,
  });

  const {
    data: contacts = [],
    isLoading: contactsLoading,
  } = useQuery({
    queryKey: ['contact-lists-contacts'],
    queryFn: fetchContactsForLists,
    enabled: !!user,
    staleTime: 60_000,
  });

  const loading = listsLoading || contactsLoading;

  const createMutation = useMutation({
    mutationFn: async (listData: {
      name: string;
      description?: string;
      artist_id?: string;
      event_id?: string;
      is_exclusion?: boolean;
      contactIds: string[];
    }) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');

      const { data: newList, error: listError } = await supabase
        .from('contact_lists')
        .insert({
          name: listData.name,
          description: listData.description,
          artist_id: listData.artist_id || null,
          event_id: listData.event_id || null,
          is_exclusion: !!listData.is_exclusion,
          user_id: authUser.id
        })
        .select()
        .single();

      if (listError) throw listError;

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

      return newList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({ title: "Succès", description: "Liste de contacts créée avec succès" });
    },
    onError: (error) => {
      logger.error('Error creating contact list:', error);
      toast({ title: "Erreur", description: "Impossible de créer la liste de contacts", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ listId, updates }: {
      listId: string;
      updates: {
        name?: string;
        description?: string;
        artist_id?: string | null;
        event_id?: string | null;
        is_exclusion?: boolean;
        contactIds?: string[];
      };
    }) => {
      if (updates.name !== undefined || updates.description !== undefined ||
        updates.artist_id !== undefined || updates.event_id !== undefined ||
        updates.is_exclusion !== undefined) {
        const { error: updateError } = await supabase
          .from('contact_lists')
          .update({
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.artist_id !== undefined && { artist_id: updates.artist_id }),
            ...(updates.event_id !== undefined && { event_id: updates.event_id }),
            ...(updates.is_exclusion !== undefined && { is_exclusion: updates.is_exclusion })
          })
          .eq('id', listId);
        if (updateError) throw updateError;
      }

      if (updates.contactIds !== undefined) {
        const { error: deleteError } = await supabase
          .from('contact_list_members')
          .delete()
          .eq('contact_list_id', listId);
        if (deleteError) throw deleteError;

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({ title: "Succès", description: "Liste de contacts mise à jour" });
    },
    onError: (error) => {
      logger.error('Error updating contact list:', error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour la liste", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', listId);
      if (error) throw error;
      return listId;
    },
    onMutate: async (listId) => {
      await queryClient.cancelQueries({ queryKey: ['contact-lists'] });
      const previous = queryClient.getQueryData<ContactList[]>(['contact-lists']);
      queryClient.setQueryData<ContactList[]>(['contact-lists'], (old = []) =>
        old.filter(l => l.id !== listId)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['contact-lists'], context.previous);
      toast({ title: "Erreur", description: "Impossible de supprimer la liste", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Liste de contacts supprimée" });
    }
  });

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
      logger.error('Error fetching contacts in list:', error);
      return [];
    }
  };

  // Backward-compatible wrappers
  const createContactList = async (listData: Parameters<typeof createMutation.mutateAsync>[0]) => {
    return createMutation.mutateAsync(listData);
  };

  const updateContactList = async (listId: string, updates: {
    name?: string;
    description?: string;
    artist_id?: string | null;
    event_id?: string | null;
    is_exclusion?: boolean;
    contactIds?: string[];
  }) => {
    return updateMutation.mutateAsync({ listId, updates });
  };

  const deleteContactList = async (listId: string) => {
    return deleteMutation.mutateAsync(listId);
  };

  return {
    contactLists,
    contacts,
    loading,
    createContactList,
    updateContactList,
    deleteContactList,
    getContactsInList,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists-contacts'] });
    }
  };
};

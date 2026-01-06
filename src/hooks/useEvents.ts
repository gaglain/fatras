import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { logger } from '@/lib/logger';

export interface Event {
  id: string;
  user_id: string;
  external_id?: string;
  contact_id?: string;
  artist_id?: string;
  title: string;
  description?: string;
  event_type?: string;
  venue?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  requirements?: string;
  notes?: string;
  budget_min?: number;
  budget_max?: number;
  attendees_count?: number;
  created_at: string;
  updated_at: string;
}

const mapDbToEvent = (event: any): Event => ({
  id: event.id,
  user_id: event.user_id,
  external_id: event.external_id || '',
  contact_id: event.contact_id || undefined,
  artist_id: event.artist_id || undefined,
  title: event.title,
  description: event.description || '',
  event_type: event.event_type || '',
  venue: event.venue || '',
  address: event.address || '',
  city: event.city || '',
  postal_code: event.postal_code || '',
  country: event.country || '',
  start_date: event.start_date || '',
  end_date: event.end_date || '',
  status: event.status || 'pending',
  requirements: event.requirements || '',
  notes: event.notes || '',
  budget_min: event.budget_min || 0,
  budget_max: event.budget_max || 0,
  attendees_count: event.attendees_count || 0,
  created_at: event.created_at,
  updated_at: event.updated_at
});

const fetchEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching events:', error);
    throw error;
  }

  return (data || []).map(mapDbToEvent);
};

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { 
    data: events = [], 
    isLoading: loading,
    refetch 
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: !!user,
    staleTime: 60000,
  });

  const addEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: eventData.user_id,
          contact_id: eventData.contact_id,
          artist_id: eventData.artist_id,
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.event_type,
          venue: eventData.venue,
          address: eventData.address,
          city: eventData.city,
          postal_code: eventData.postal_code,
          country: eventData.country,
          start_date: eventData.start_date || null,
          end_date: eventData.end_date || null,
          status: eventData.status,
          requirements: eventData.requirements,
          notes: eventData.notes,
          budget_min: eventData.budget_min || null,
          budget_max: eventData.budget_max || null,
          attendees_count: eventData.attendees_count || null
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating event:', error);
        throw error;
      }

      return mapDbToEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          contact_id: updates.contact_id,
          artist_id: updates.artist_id,
          title: updates.title,
          description: updates.description,
          event_type: updates.event_type,
          venue: updates.venue,
          address: updates.address,
          city: updates.city,
          postal_code: updates.postal_code,
          country: updates.country,
          start_date: updates.start_date,
          end_date: updates.end_date,
          status: updates.status,
          requirements: updates.requirements,
          notes: updates.notes,
          budget_min: updates.budget_min,
          budget_max: updates.budget_max,
          attendees_count: updates.attendees_count
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    return addEventMutation.mutateAsync(eventData);
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    return updateEventMutation.mutateAsync({ id, updates });
  };

  const deleteEvent = async (id: string) => {
    return deleteEventMutation.mutateAsync(id);
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Event {
  id: string;
  user_id: string;
  contact_id?: string;
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

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      if (data && !error) {
        const eventsData: Event[] = data.map(event => ({
          id: event.id,
          user_id: event.user_id,
          contact_id: event.contact_id || undefined,
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
        }));
        setEvents(eventsData);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [user]);

  const addEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: eventData.user_id,
        contact_id: eventData.contact_id,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        venue: eventData.venue,
        address: eventData.address,
        city: eventData.city,
        postal_code: eventData.postal_code,
        country: eventData.country,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        status: eventData.status,
        requirements: eventData.requirements,
        notes: eventData.notes,
        budget_min: eventData.budget_min,
        budget_max: eventData.budget_max,
        attendees_count: eventData.attendees_count
      })
      .select()
      .single();

    if (data && !error) {
      const newEvent: Event = {
        id: data.id,
        user_id: data.user_id,
        contact_id: data.contact_id || undefined,
        title: data.title,
        description: data.description || '',
        event_type: data.event_type || '',
        venue: data.venue || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        status: data.status || 'pending',
        requirements: data.requirements || '',
        notes: data.notes || '',
        budget_min: data.budget_min || 0,
        budget_max: data.budget_max || 0,
        attendees_count: data.attendees_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    }
    return null;
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    const { data, error } = await supabase
      .from('events')
      .update({
        contact_id: updates.contact_id,
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

    if (data && !error) {
      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ));
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (!error) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent
  };
};
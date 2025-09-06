import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EventType {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEventTypes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .order('name');

      if (data && !error) {
        setEventTypes(data);
      }
      setLoading(false);
    };

    fetchEventTypes();
  }, [user]);

  const addEventType = async (eventTypeData: Omit<EventType, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('event_types')
      .insert({
        user_id: eventTypeData.user_id,
        name: eventTypeData.name,
        description: eventTypeData.description,
        color: eventTypeData.color
      })
      .select()
      .single();

    if (data && !error) {
      setEventTypes(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  const updateEventType = async (id: string, updates: Partial<EventType>) => {
    const { data, error } = await supabase
      .from('event_types')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color
      })
      .eq('id', id)
      .select()
      .single();

    if (data && !error) {
      setEventTypes(prev => prev.map(type => 
        type.id === id ? { ...type, ...updates } : type
      ));
    }
  };

  const deleteEventType = async (id: string) => {
    const { error } = await supabase
      .from('event_types')
      .delete()
      .eq('id', id);

    if (!error) {
      setEventTypes(prev => prev.filter(type => type.id !== id));
    }
  };

  return {
    eventTypes,
    loading,
    addEventType,
    updateEventType,
    deleteEventType
  };
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  calendar_id: string;
  provider: string;
  external_id: string;
  attendees: string[];
}

export const useNylasCalendarSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<{ id: string; name: string; description?: string; read_only?: boolean }[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const syncCalendars = async (grantId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nylas-calendar-sync', {
        body: {
          action: 'sync_calendars',
          user_id: user.id,
          grant_id: grantId
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(data.message);
        await loadEvents();
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      logger.error('Erreur sync calendriers:', error);
      toast.error('Erreur lors de la synchronisation des calendriers');
    } finally {
      setIsLoading(false);
    }
  };

  const listCalendars = async (grantId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('nylas-calendar-sync', {
        body: {
          action: 'list_calendars',
          user_id: user.id,
          grant_id: grantId
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setCalendars(data.calendars);
        return data.calendars;
      } else {
        throw new Error(data.error);
      }
    } catch (error: unknown) {
      logger.error('Erreur liste calendriers:', error);
      toast.error('Erreur lors de la récupération des calendriers');
      return [];
    }
  };

  const loadEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      logger.error('Erreur chargement événements:', error);
      toast.error('Erreur lors du chargement des événements');
    }
  };

  const getUpcomingEvents = (limit = 5) => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_time) >= now)
      .slice(0, limit);
  };

  return {
    isLoading,
    calendars,
    events,
    syncCalendars,
    listCalendars,
    loadEvents,
    getUpcomingEvents
  };
};
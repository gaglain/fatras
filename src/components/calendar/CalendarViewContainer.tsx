import React, { useState, useEffect, useMemo } from 'react';
import { CalendarView, CalendarEvent, CalendarSource } from './CalendarView';
import { useAuth } from '@/hooks/useAuth';
import { useNylasCalendarSync } from '@/hooks/useNylasCalendarSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CalendarViewContainer: React.FC = () => {
  const { user } = useAuth();
  const { events: nylasEvents, loadEvents } = useNylasCalendarSync();
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<CalendarSource[]>([]);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadLocalEvents();
      loadCalendarSources();
    }
  }, [user]);

  const loadLocalEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setLocalEvents(data || []);
    } catch (error) {
      console.error('Erreur chargement événements locaux:', error);
    }
  };

  const loadCalendarSources = async () => {
    if (!user) return;

    const sources: CalendarSource[] = [
      {
        id: 'local',
        name: 'Mes événements',
        color: '#3B82F6',
        visible: true,
        provider: 'local'
      }
    ];

    // Ajouter les calendriers Nylas
    if (nylasEvents.length > 0) {
      const nylasCalendarIds = [...new Set(nylasEvents.map(e => e.calendar_id))];
      nylasCalendarIds.forEach((calId, index) => {
        sources.push({
          id: calId,
          name: `Calendrier ${index + 1}`,
          color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
          visible: true,
          provider: 'nylas'
        });
      });
    }

    setCalendars(sources);
  };

  useEffect(() => {
    loadCalendarSources();
  }, [nylasEvents]);

  const allEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Événements Nylas
    nylasEvents.forEach(event => {
      events.push({
        id: event.id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        calendar_id: event.calendar_id,
        provider: 'nylas',
        attendees: event.attendees
      });
    });

    // Événements locaux
    localEvents.forEach(event => {
      events.push({
        id: event.id,
        title: event.title,
        description: event.description || '',
        start_time: event.start_date || new Date().toISOString(),
        end_time: event.end_date || new Date().toISOString(),
        location: `${event.venue || ''} ${event.city || ''}`.trim(),
        calendar_id: 'local',
        provider: 'local',
        attendees: []
      });
    });

    return events;
  }, [nylasEvents, localEvents]);

  const handleCalendarToggle = (calendarId: string) => {
    setCalendars(prev => 
      prev.map(cal => 
        cal.id === calendarId 
          ? { ...cal, visible: !cal.visible }
          : cal
      )
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    toast.info(`Événement: ${event.title}`, {
      description: `${event.start_time} - ${event.location || 'Pas de lieu'}`
    });
  };

  return (
    <CalendarView
      events={allEvents}
      calendars={calendars}
      onCalendarToggle={handleCalendarToggle}
      onEventClick={handleEventClick}
    />
  );
};
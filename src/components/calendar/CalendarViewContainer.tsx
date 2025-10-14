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

    // Récupérer les calendriers Nylas avec leurs vrais noms
    try {
      const { data: calendarData, error } = await supabase
        .from('calendar_events')
        .select('calendar_id, provider')
        .eq('user_id', user.id);

      if (!error && calendarData) {
        // Utiliser les données des logs pour mapper les noms de calendriers
        const calendarNames: { [key: string]: string } = {
          'edouard.lermite@gmail.com': 'Edouard Lermite',
          'legolom@gmail.com': 'Legolom',
          'koko.quimbert@gmail.com': 'Koko Quimbert',
          'avecdesgeraniums@gmail.com': 'Avec des Géraniums',
          'bigbangbluegrassband@gmail.com': 'Big Bang Bluegrass Band',
          'fatrasplanning@gmail.com': 'Fatras Planning',
          'olivier.lacire@gmail.com': 'Olivier Lacire',
          'romaincadiou@free.fr': 'Romain Cadiou',
          'rajmaplanning@gmail.com': 'Rajma Planning',
          'awakeirishtrance@gmail.com': 'Awake Irish Trance'
        };

        const uniqueCalendars = [...new Set(calendarData.map(e => e.calendar_id))];
        uniqueCalendars.forEach((calId, index) => {
          const displayName = calendarNames[calId] || calId.replace('@gmail.com', '').replace('@free.fr', '') || `Calendrier ${index + 1}`;
          sources.push({
            id: calId,
            name: displayName,
            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
            visible: true,
            provider: 'nylas'
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des calendriers:', error);
    }

    setCalendars(sources);
  };

  useEffect(() => {
    loadCalendarSources();
  }, [nylasEvents]);

  const allEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Événements Nylas - préfixe pour éviter les doublons d'ID
    nylasEvents.forEach(event => {
      events.push({
        id: `nylas-${event.id}`,
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

    // Événements locaux - filtrer ceux sans date et préfixer l'ID
    localEvents
      .filter(event => event.start_date && event.end_date) // Ignorer les événements sans dates
      .forEach(event => {
        events.push({
          id: `local-${event.id}`,
          title: event.title,
          description: event.description || '',
          start_time: event.start_date,
          end_time: event.end_date,
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
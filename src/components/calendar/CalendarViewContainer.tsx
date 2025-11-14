import React, { useState, useEffect, useMemo } from 'react';
import { CalendarView, CalendarEvent, CalendarSource } from './CalendarView';
import { useAuth } from '@/hooks/useAuth';
import { useNylasCalendarSync } from '@/hooks/useNylasCalendarSync';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAppSettings } from '@/hooks/useAppSettings';

export const CalendarViewContainer: React.FC = () => {
  const { user } = useAuth();
  const { events: nylasEvents, loadEvents } = useNylasCalendarSync();
  const { getSetting, setSetting } = useAppSettings();
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [calendars, setCalendars] = useState<CalendarSource[]>([]);
  const [fallbackNylas, setFallbackNylas] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadEvents();
      loadNylasFallback();
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
        .order('start_date', { ascending: true });

      if (error) throw error;
      setLocalEvents(data || []);
    } catch (error) {
      console.error('Erreur chargement événements locaux:', error);
    }
  };

  const loadNylasFallback = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) throw error;
      setFallbackNylas(data || []);
    } catch (error) {
      console.error('Erreur chargement événements Nylas (fallback):', error);
    }
  };

  const loadCalendarSources = async () => {
    if (!user) return;

    // Charger les calendriers visibles depuis app_settings
    const savedVisibleCalendars = getSetting('visible_calendars', '');
    const visibleCalendarIds = savedVisibleCalendars ? JSON.parse(savedVisibleCalendars) : [];

    const sources: CalendarSource[] = [
      {
        id: 'local',
        name: 'Mes événements',
        color: '#3B82F6',
        visible: visibleCalendarIds.length === 0 || visibleCalendarIds.includes('local'),
        provider: 'local'
      }
    ];

    try {
      const { data: calendarData, error } = await supabase
        .from('calendar_events')
        .select('calendar_id, provider');

      if (!error && calendarData) {
        // Éviter les doublons, en particulier l'ID "local" qui est déjà ajouté
        const addedIds = new Set<string>(sources.map(s => s.id));

        // Map des noms amicaux connus
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

        // Conserver un ordre stable et éviter "local"
        const uniqueCalendars = [...new Set(calendarData.map(e => e.calendar_id))]
          .filter((calId): calId is string => !!calId && calId !== 'local');

        uniqueCalendars.forEach((calId, index) => {
          if (addedIds.has(calId)) return; // dédoublonnage
          const displayName = calendarNames[calId] || calId.replace('@gmail.com', '').replace('@free.fr', '') || `Calendrier ${index + 1}`;
          sources.push({
            id: calId,
            name: displayName,
            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
            visible: visibleCalendarIds.length === 0 || visibleCalendarIds.includes(calId),
            provider: 'nylas'
          });
          addedIds.add(calId);
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
    const nylasSource = (nylasEvents && nylasEvents.length > 0) ? nylasEvents : fallbackNylas;
    nylasSource.forEach(event => {
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
  }, [nylasEvents, fallbackNylas, localEvents]);

  const handleCalendarToggle = (calendarId: string) => {
    setCalendars(prev => {
      const updated = prev.map(cal => 
        cal.id === calendarId 
          ? { ...cal, visible: !cal.visible }
          : cal
      );
      
      // Sauvegarder les calendriers visibles dans app_settings
      const visibleIds = updated.filter(cal => cal.visible).map(cal => cal.id);
      setSetting('visible_calendars', JSON.stringify(visibleIds));
      
      return updated;
    });
  };

  const handleToggleAll = () => {
    setCalendars(prev => {
      const allVisible = prev.every(cal => cal.visible);
      const updated = prev.map(cal => ({ ...cal, visible: !allVisible }));
      
      // Sauvegarder les calendriers visibles dans app_settings
      const visibleIds = updated.filter(cal => cal.visible).map(cal => cal.id);
      setSetting('visible_calendars', JSON.stringify(visibleIds));
      
      return updated;
    });
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
      onToggleAll={handleToggleAll}
      onEventClick={handleEventClick}
    />
  );
};
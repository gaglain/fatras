import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNylasCalendarSync } from '@/hooks/useNylasCalendarSync';
import { logger } from '@/lib/logger';
import { useMemo, useEffect } from 'react';
import type { CalendarEvent, CalendarSource } from '@/components/calendar/CalendarView';
import { useAppSettings } from '@/hooks/useAppSettings';

const STALE_TIME = 1000 * 60 * 2; // 2 minutes

async function fetchLocalEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function fetchNylasFallback() {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function fetchCalendarIds() {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('calendar_id, provider');
  if (error) throw error;
  return data || [];
}

export const useCalendarData = () => {
  const { user } = useAuth();
  const { events: nylasEvents, loadEvents } = useNylasCalendarSync();
  const { getSetting } = useAppSettings();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) loadEvents();
  }, [user]);

  const localEventsQuery = useQuery({
    queryKey: ['calendar-local-events'],
    queryFn: fetchLocalEvents,
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const nylasFallbackQuery = useQuery({
    queryKey: ['calendar-nylas-fallback'],
    queryFn: fetchNylasFallback,
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const calendarIdsQuery = useQuery({
    queryKey: ['calendar-source-ids'],
    queryFn: fetchCalendarIds,
    enabled: !!user,
    staleTime: STALE_TIME,
  });

  const localEvents = localEventsQuery.data || [];
  const fallbackNylas = nylasFallbackQuery.data || [];
  const calendarData = calendarIdsQuery.data || [];

  const calendarNames: Record<string, string> = {
    'edouard.lermite@gmail.com': 'Edouard Lermite',
    'legolom@gmail.com': 'Legolom',
    'koko.quimbert@gmail.com': 'Koko Quimbert',
    'avecdesgeraniums@gmail.com': 'Avec des Géraniums',
    'bigbangbluegrassband@gmail.com': 'Big Bang Bluegrass Band',
    'fatrasplanning@gmail.com': 'Fatras Planning',
    'olivier.lacire@gmail.com': 'Olivier Lacire',
    'romaincadiou@free.fr': 'Romain Cadiou',
    'rajmaplanning@gmail.com': 'Rajma Planning',
    'awakeirishtrance@gmail.com': 'Awake Irish Trance',
  };

  const buildCalendarSources = (): CalendarSource[] => {
    const savedVisibleCalendars = getSetting('visible_calendars', '');
    const visibleCalendarIds: string[] = savedVisibleCalendars
      ? JSON.parse(savedVisibleCalendars)
      : [];

    const sources: CalendarSource[] = [
      {
        id: 'local',
        name: 'Mes événements',
        color: '#3B82F6',
        visible:
          visibleCalendarIds.length === 0 || visibleCalendarIds.includes('local'),
        provider: 'local',
      },
    ];

    const addedIds = new Set<string>(['local']);
    const uniqueCalendars = [
      ...new Set(calendarData.map((e) => e.calendar_id)),
    ].filter((calId): calId is string => !!calId && calId !== 'local');

    uniqueCalendars.forEach((calId, index) => {
      if (addedIds.has(calId)) return;
      const displayName =
        calendarNames[calId] ||
        calId.replace('@gmail.com', '').replace('@free.fr', '') ||
        `Calendrier ${index + 1}`;
      sources.push({
        id: calId,
        name: displayName,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        visible:
          visibleCalendarIds.length === 0 || visibleCalendarIds.includes(calId),
        provider: 'nylas',
      });
      addedIds.add(calId);
    });

    return sources;
  };

  const allEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    const nylasSource =
      nylasEvents && nylasEvents.length > 0 ? nylasEvents : fallbackNylas;
    nylasSource.forEach((event) => {
      events.push({
        id: `nylas-${event.id}`,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        calendar_id: event.calendar_id,
        provider: 'nylas',
        attendees: event.attendees,
      });
    });

    localEvents
      .filter((event) => event.start_date && event.end_date)
      .forEach((event) => {
        events.push({
          id: `local-${event.id}`,
          title: event.title,
          description: event.description || '',
          start_time: event.start_date,
          end_time: event.end_date,
          location: `${event.venue || ''} ${event.city || ''}`.trim(),
          calendar_id: 'local',
          provider: 'local',
          attendees: [],
        });
      });

    return events;
  }, [nylasEvents, fallbackNylas, localEvents]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar-local-events'] });
    queryClient.invalidateQueries({ queryKey: ['calendar-nylas-fallback'] });
    queryClient.invalidateQueries({ queryKey: ['calendar-source-ids'] });
  };

  return {
    allEvents,
    buildCalendarSources,
    isLoading:
      localEventsQuery.isLoading ||
      nylasFallbackQuery.isLoading ||
      calendarIdsQuery.isLoading,
    invalidateAll,
  };
};

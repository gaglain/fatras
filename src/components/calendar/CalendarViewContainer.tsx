import React, { useState, useEffect, useMemo } from 'react';
import { CalendarView, CalendarEvent, CalendarSource } from './CalendarView';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';

export const CalendarViewContainer: React.FC = () => {
  const { allEvents, buildCalendarSources, isLoading } = useCalendarData();
  const { setSetting } = useAppSettings();
  const [calendars, setCalendars] = useState<CalendarSource[]>([]);

  // Rebuild calendar sources when data changes — memoized via allEvents ref
  useEffect(() => {
    setCalendars(buildCalendarSources());
  }, [allEvents]);

  const handleCalendarToggle = (calendarId: string) => {
    setCalendars(prev => {
      const updated = prev.map(cal =>
        cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
      );
      const visibleIds = updated.filter(cal => cal.visible).map(cal => cal.id);
      setSetting('visible_calendars', JSON.stringify(visibleIds));
      return updated;
    });
  };

  const handleToggleAll = () => {
    setCalendars(prev => {
      const allVisible = prev.every(cal => cal.visible);
      const updated = prev.map(cal => ({ ...cal, visible: !allVisible }));
      const visibleIds = updated.filter(cal => cal.visible).map(cal => cal.id);
      setSetting('visible_calendars', JSON.stringify(visibleIds));
      return updated;
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    toast.info(`Événement: ${event.title}`, {
      description: `${event.start_time} - ${event.location || 'Pas de lieu'}`,
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

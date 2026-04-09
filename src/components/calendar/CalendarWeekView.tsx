import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './CalendarView';

interface CalendarWeekViewProps {
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getCalendarColor: (calendarId: string) => string;
  parseDate: (value: string) => Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate, getEventsForDate, getCalendarColor, parseDate, onEventClick
}) => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="text-center">
        <h3 className="text-sm sm:text-lg font-semibold">
          Semaine du {format(start, 'd', { locale: fr })} au {format(end, 'd MMM yyyy', { locale: fr })}
        </h3>
      </div>
      
      {/* Mobile: vertical list */}
      <div className="sm:hidden space-y-2">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          return (
            <Card key={day.toISOString()} className={isToday ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isToday ? 'text-primary' : ''}`}>{format(day, 'EEEE d', { locale: fr })}</span>
                  {dayEvents.length > 0 && <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>}
                </div>
              </CardHeader>
              {dayEvents.length > 0 && (
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayEvents.map(event => (
                    <div key={event.id} className="p-2 rounded text-sm cursor-pointer hover:opacity-80 border-l-2 bg-background/50" style={{ borderLeftColor: getCalendarColor(event.calendar_id) }} onClick={() => onEventClick?.(event)}>
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{format(parseDate(event.start_time), 'HH:mm')}{event.location && ` · ${event.location}`}</div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          return (
            <Card key={day.toISOString()} className={`min-h-32 ${isToday ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="p-2">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: fr })}</div>
                  <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="p-2 rounded text-xs cursor-pointer hover:opacity-80 border-l-2 bg-background/50" style={{ borderLeftColor: getCalendarColor(event.calendar_id) }} onClick={() => onEventClick?.(event)}>
                    <div className="font-medium truncate text-foreground">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{format(parseDate(event.start_time), 'HH:mm')}</div>
                    {event.location && <div className="text-xs text-muted-foreground truncate">📍 {event.location}</div>}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 3} autres</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

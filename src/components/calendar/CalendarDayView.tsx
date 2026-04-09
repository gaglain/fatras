import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './CalendarView';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  getCalendarColor: (calendarId: string) => string;
  formatEventTime: (startTime: string, endTime: string) => string;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  currentDate, events, getCalendarColor, formatEventTime, onEventClick
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </h3>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun événement pour cette journée
          </div>
        ) : (
          events.map(event => (
            <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEventClick?.(event)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: getCalendarColor(event.calendar_id) }} />
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.start_time, event.end_time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

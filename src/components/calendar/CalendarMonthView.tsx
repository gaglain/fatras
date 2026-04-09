import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './CalendarView';

interface CalendarMonthViewProps {
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getCalendarColor: (calendarId: string) => string;
  formatEventTime: (startTime: string, endTime: string) => string;
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate, getEventsForDate, getCalendarColor, formatEventTime, onEventClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h3>
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
          <div key={idx} className="text-center text-[10px] sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
            <span className="sm:hidden">{day}</span>
            <span className="hidden sm:inline">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][idx]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          return (
            <div key={day.toISOString()} className={`min-h-16 sm:min-h-24 p-0.5 sm:p-2 rounded-md border bg-card ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}>
              <div className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${isToday ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
              <div className="space-y-0.5">
                <div className="sm:hidden flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 4).map(event => (
                    <div key={event.id} className="w-2 h-2 rounded-full cursor-pointer" style={{ backgroundColor: getCalendarColor(event.calendar_id) }} onClick={() => onEventClick?.(event)} title={event.title} />
                  ))}
                  {dayEvents.length > 4 && <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 4}</span>}
                </div>
                <div className="hidden sm:block space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="text-xs p-1 rounded cursor-pointer hover:opacity-80 border-l-2 bg-background/50" style={{ borderLeftColor: getCalendarColor(event.calendar_id) }} onClick={() => onEventClick?.(event)} title={`${event.title} - ${formatEventTime(event.start_time, event.end_time)}`}>
                      <div className="font-medium truncate text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(event.start_time), 'HH:mm')}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} autres</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

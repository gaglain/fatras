import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  calendar_id: string;
  provider: string;
  attendees?: string[];
}

export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  provider: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  calendars: CalendarSource[];
  onCalendarToggle: (calendarId: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

type ViewType = 'day' | 'week' | 'month';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  calendars,
  onCalendarToggle,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');

  const visibleCalendarIds = useMemo(() => 
    calendars.filter(cal => cal.visible).map(cal => cal.id),
    [calendars]
  );

  const filteredEvents = useMemo(() => 
    events.filter(event => visibleCalendarIds.includes(event.calendar_id)),
    [events, visibleCalendarIds]
  );

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.color || '#3B82F6';
  };

  const navigatePrev = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, -1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const getDateRange = () => {
    switch (viewType) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
      case 'week':
        return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`;
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun événement pour cette journée
            </div>
          ) : (
            dayEvents.map(event => (
              <Card 
                key={event.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEventClick?.(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getCalendarColor(event.calendar_id) }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
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

  const renderWeekView = () => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Semaine du {format(start, 'd', { locale: fr })} au {format(end, 'd MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card key={day.toISOString()} className={`min-h-32 ${isToday ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="p-2">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="p-2 rounded text-xs cursor-pointer hover:opacity-80 border-l-2 bg-background/50"
                      style={{ borderLeftColor: getCalendarColor(event.calendar_id) }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium truncate text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), 'HH:mm')}
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground truncate">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} autres
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <Card 
                key={day.toISOString()} 
                className={`min-h-24 ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <CardContent className="p-2">
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 border-l-2 bg-background/50 mb-1"
                        style={{ borderLeftColor: getCalendarColor(event.calendar_id) }}
                        onClick={() => onEventClick?.(event)}
                        title={`${event.title} - ${formatEventTime(event.start_time, event.end_time)}`}
                      >
                        <div className="font-medium truncate text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} autres
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (viewType) {
      case 'day': return renderDayView();
      case 'week': return renderWeekView();
      case 'month': return renderMonthView();
    }
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de navigation et vue */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as ViewType[]).map(view => (
            <Button
              key={view}
              variant={viewType === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType(view)}
            >
              {view === 'day' ? 'Jour' : view === 'week' ? 'Semaine' : 'Mois'}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtres des calendriers en haut */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Calendriers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {calendars.map(calendar => (
              <div key={calendar.id} className="flex items-center space-x-2">
                <Checkbox
                  id={calendar.id}
                  checked={calendar.visible}
                  onCheckedChange={() => onCalendarToggle(calendar.id)}
                />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <label htmlFor={calendar.id} className="text-sm font-medium cursor-pointer">
                    {calendar.name}
                  </label>
                  <Badge variant="secondary" className="text-xs">
                    {calendar.provider}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vue du calendrier pleine largeur */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentView()}
        </CardContent>
      </Card>
    </div>
  );
};
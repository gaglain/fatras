import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Search } from 'lucide-react';
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
  onToggleAll?: () => void;
  onEventClick?: (event: CalendarEvent) => void;
}

type ViewType = 'day' | 'week' | 'month';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  calendars,
  onCalendarToggle,
  onToggleAll,
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Robust date parser to handle Postgres and ISO strings (+HH, +HHMM, +HH:MM)
  const parseDate = (value: string) => {
    if (!value) return new Date(NaN);
    let s = value.trim();
    // Replace space with T
    if (s.includes(' ') && !s.includes('T')) s = s.replace(' ', 'T');

    // Normalize timezone formats
    // 1) +00 or +0000 or +00:00 -> Z
    if (/\+00(?::?00)?$/.test(s) || /\+0000$/.test(s)) {
      s = s.replace(/\+00(?::?00)?$/, 'Z').replace(/\+0000$/, 'Z');
    }
    // 2) +HHMM => +HH:MM
    else if (/[+-]\d{4}$/.test(s)) {
      s = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    }
    // 3) +HH => +HH:00
    else if (/[+-]\d{2}$/.test(s)) {
      s = s + ':00';
    }

    // If no timezone, assume UTC to avoid Safari shifts
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += 'Z';

    return new Date(s);
  };

  const filteredCalendars = useMemo(() => {
    if (!searchQuery.trim()) return calendars;
    return calendars.filter(cal => 
      cal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [calendars, searchQuery]);

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
      const eventStart = parseDate(event.start_time);
      const eventEnd = parseDate(event.end_time);
      const targetDate = startOfDay(date);
      const eventStartDay = startOfDay(eventStart);
      const eventEndDay = startOfDay(eventEnd);
      
      // Vérifier si la date cible se situe entre le début et la fin de l'événement
      return targetDate >= eventStartDay && targetDate <= eventEndDay;
    });
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = parseDate(startTime);
    const end = parseDate(endTime);
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
              <Card key={day.toISOString()} className={`${isToday ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'EEEE d', { locale: fr })}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{dayEvents.length}</Badge>
                    )}
                  </div>
                </CardHeader>
                {dayEvents.length > 0 && (
                  <CardContent className="p-3 pt-0 space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-2 rounded text-sm cursor-pointer hover:opacity-80 border-l-2 bg-background/50"
                        style={{ borderLeftColor: getCalendarColor(event.calendar_id) }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseDate(event.start_time), 'HH:mm')}
                          {event.location && ` · ${event.location}`}
                        </div>
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
                        {format(parseDate(event.start_time), 'HH:mm')}
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
      <div className="space-y-2 sm:space-y-4">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
            <div key={idx} className="text-center text-[10px] sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
              <span className="sm:hidden">{day}</span>
              <span className="hidden sm:inline">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][idx]}</span>
            </div>
          ))}
        </div>
        
        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-16 sm:min-h-24 p-0.5 sm:p-2 rounded-md border bg-card ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {/* Mobile: show only colored dots, Desktop: show event details */}
                  <div className="sm:hidden flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 4).map(event => (
                      <div
                        key={event.id}
                        className="w-2 h-2 rounded-full cursor-pointer"
                        style={{ backgroundColor: getCalendarColor(event.calendar_id) }}
                        onClick={() => onEventClick?.(event)}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 4}</span>
                    )}
                  </div>
                  {/* Desktop: full event display */}
                  <div className="hidden sm:block space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 border-l-2 bg-background/50"
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
                </div>
              </div>
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
    <div className="space-y-3 sm:space-y-6">
      {/* Contrôles de navigation et vue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={navigatePrev} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs sm:text-sm h-8 px-2 sm:h-9 sm:px-3">
              <span className="hidden sm:inline">Aujourd'hui</span>
              <span className="sm:hidden">Auj.</span>
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View buttons on same row for mobile */}
          <div className="flex gap-1 sm:hidden">
            {(['day', 'week', 'month'] as ViewType[]).map(view => (
              <Button
                key={view}
                variant={viewType === view ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType(view)}
                className="text-xs h-8 px-2"
              >
                {view === 'day' ? 'J' : view === 'week' ? 'S' : 'M'}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Desktop view buttons */}
        <div className="hidden sm:flex gap-2">
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

      {/* Filtres des calendriers - collapsible sur mobile */}
      <Card>
        <CardHeader className="p-3 sm:pb-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Calendriers
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 sm:pl-8 h-8 text-xs sm:text-sm w-full sm:w-[200px]"
                />
              </div>
              {onToggleAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAll}
                  className="text-xs whitespace-nowrap"
                >
                  <span className="hidden sm:inline">{calendars.every(cal => cal.visible) ? 'Tout masquer' : 'Tout afficher'}</span>
                  <span className="sm:hidden">{calendars.every(cal => cal.visible) ? 'Masquer' : 'Afficher'}</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filteredCalendars.map(calendar => (
              <div key={calendar.id} className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id={calendar.id}
                  checked={calendar.visible}
                  onCheckedChange={() => onCalendarToggle(calendar.id)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <div className="flex items-center gap-1 sm:gap-2">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <label htmlFor={calendar.id} className="text-xs sm:text-sm font-medium cursor-pointer truncate max-w-[80px] sm:max-w-none">
                    {calendar.name}
                  </label>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-flex">
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
        <CardContent className="p-2 sm:p-6">
          {renderCurrentView()}
        </CardContent>
      </Card>
    </div>
  );
};
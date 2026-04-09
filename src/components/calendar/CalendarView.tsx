import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format, addDays, startOfDay, endOfDay, addWeeks, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarMonthView } from './CalendarMonthView';

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

const parseDate = (value: string) => {
  if (!value) return new Date(NaN);
  let s = value.trim();
  if (s.includes(' ') && !s.includes('T')) s = s.replace(' ', 'T');
  if (/\+00(?::?00)?$/.test(s) || /\+0000$/.test(s)) s = s.replace(/\+00(?::?00)?$/, 'Z').replace(/\+0000$/, 'Z');
  else if (/[+-]\d{4}$/.test(s)) s = s.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  else if (/[+-]\d{2}$/.test(s)) s = s + ':00';
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += 'Z';
  return new Date(s);
};

export const CalendarView: React.FC<CalendarViewProps> = ({ events, calendars, onCalendarToggle, onToggleAll, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalendars = useMemo(() => searchQuery.trim() ? calendars.filter(cal => cal.name.toLowerCase().includes(searchQuery.toLowerCase())) : calendars, [calendars, searchQuery]);
  const visibleCalendarIds = useMemo(() => calendars.filter(cal => cal.visible).map(cal => cal.id), [calendars]);
  const filteredEvents = useMemo(() => events.filter(event => visibleCalendarIds.includes(event.calendar_id)), [events, visibleCalendarIds]);

  const getCalendarColor = (calendarId: string) => calendars.find(cal => cal.id === calendarId)?.color || '#3B82F6';

  const getEventsForDate = (date: Date) => filteredEvents.filter(event => {
    const eventStart = startOfDay(parseDate(event.start_time));
    const eventEnd = startOfDay(parseDate(event.end_time));
    const target = startOfDay(date);
    return target >= eventStart && target <= eventEnd;
  });

  const formatEventTime = (startTime: string, endTime: string) => {
    return `${format(parseDate(startTime), 'HH:mm', { locale: fr })} - ${format(parseDate(endTime), 'HH:mm', { locale: fr })}`;
  };

  const navigate = (dir: -1 | 1) => {
    setCurrentDate(prev => viewType === 'day' ? addDays(prev, dir) : viewType === 'week' ? addWeeks(prev, dir) : addMonths(prev, dir));
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs sm:text-sm h-8 px-2 sm:h-9 sm:px-3"><span className="hidden sm:inline">Aujourd'hui</span><span className="sm:hidden">Auj.</span></Button>
            <Button variant="outline" size="sm" onClick={() => navigate(1)} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-1 sm:hidden">
            {(['day', 'week', 'month'] as ViewType[]).map(view => (
              <Button key={view} variant={viewType === view ? 'default' : 'outline'} size="sm" onClick={() => setViewType(view)} className="text-xs h-8 px-2">
                {view === 'day' ? 'J' : view === 'week' ? 'S' : 'M'}
              </Button>
            ))}
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {(['day', 'week', 'month'] as ViewType[]).map(view => (
            <Button key={view} variant={viewType === view ? 'default' : 'outline'} size="sm" onClick={() => setViewType(view)}>
              {view === 'day' ? 'Jour' : view === 'week' ? 'Semaine' : 'Mois'}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 sm:pb-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Calendar className="h-4 w-4 sm:h-5 sm:w-5" />Calendriers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-7 sm:pl-8 h-8 text-xs sm:text-sm w-full sm:w-[200px]" />
              </div>
              {onToggleAll && (
                <Button variant="ghost" size="sm" onClick={onToggleAll} className="text-xs whitespace-nowrap">
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
                <Checkbox id={calendar.id} checked={calendar.visible} onCheckedChange={() => onCalendarToggle(calendar.id)} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: calendar.color }} />
                  <label htmlFor={calendar.id} className="text-xs sm:text-sm font-medium cursor-pointer truncate max-w-[80px] sm:max-w-none">{calendar.name}</label>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-flex">{calendar.provider}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2 sm:p-6">
          {viewType === 'day' && <CalendarDayView currentDate={currentDate} events={getEventsForDate(currentDate)} getCalendarColor={getCalendarColor} formatEventTime={formatEventTime} onEventClick={onEventClick} />}
          {viewType === 'week' && <CalendarWeekView currentDate={currentDate} getEventsForDate={getEventsForDate} getCalendarColor={getCalendarColor} parseDate={parseDate} onEventClick={onEventClick} />}
          {viewType === 'month' && <CalendarMonthView currentDate={currentDate} getEventsForDate={getEventsForDate} getCalendarColor={getCalendarColor} formatEventTime={formatEventTime} onEventClick={onEventClick} />}
        </CardContent>
      </Card>
    </div>
  );
};

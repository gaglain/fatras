import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CalendarSource {
  calendar_id: string;
  provider: string;
  event_count: number;
}

interface CalendarFilterProps {
  selectedCalendars: string[];
  onCalendarToggle: (calendarId: string) => void;
}

export const CalendarFilter: React.FC<CalendarFilterProps> = ({
  selectedCalendars,
  onCalendarToggle,
}) => {
  const [calendars, setCalendars] = useState<CalendarSource[]>([]);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('calendar_id, provider');

      if (error) throw error;

      // Group by calendar_id and count events
      const calendarMap = new Map<string, CalendarSource>();
      data?.forEach((event) => {
        if (calendarMap.has(event.calendar_id)) {
          const existing = calendarMap.get(event.calendar_id)!;
          existing.event_count++;
        } else {
          calendarMap.set(event.calendar_id, {
            calendar_id: event.calendar_id,
            provider: event.provider,
            event_count: 1,
          });
        }
      });

      setCalendars(Array.from(calendarMap.values()));
    } catch (error) {
      console.error('Erreur lors du chargement des calendriers:', error);
    }
  };

  const getCalendarDisplayName = (calendarId: string) => {
    // Map des noms de calendriers connus
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
      'awakeirishtrance@gmail.com': 'Awake Irish Trance',
      'picon.planning@gmail.com': 'Picon Planning',
      'romainbibopcadiou@gmail.com': 'Romain Bibop Cadiou',
      'gaglain.inc@gmail.com': 'Gaglain Inc',
      'fanfare.skyzophonik@gmail.com': 'Fanfare Skyzophonik',
      'local': 'Mes événements',
    };

    return calendarNames[calendarId] || calendarId.replace('@gmail.com', '').replace('@free.fr', '');
  };

  const getCalendarColor = (index: number) => {
    const colors = [
      'hsl(210, 100%, 50%)',
      'hsl(120, 60%, 50%)',
      'hsl(30, 90%, 50%)',
      'hsl(280, 70%, 50%)',
      'hsl(0, 70%, 50%)',
      'hsl(180, 60%, 45%)',
      'hsl(45, 85%, 50%)',
      'hsl(330, 70%, 55%)',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Filtrer par calendrier
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {calendars.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun calendrier disponible</p>
          ) : (
            calendars.map((calendar, index) => (
              <div key={calendar.calendar_id} className="flex items-center space-x-2">
                <Checkbox
                  id={calendar.calendar_id}
                  checked={selectedCalendars.includes(calendar.calendar_id)}
                  onCheckedChange={() => onCalendarToggle(calendar.calendar_id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCalendarColor(index) }}
                  />
                  <label
                    htmlFor={calendar.calendar_id}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {getCalendarDisplayName(calendar.calendar_id)}
                  </label>
                  <Badge variant="secondary" className="text-xs">
                    {calendar.event_count}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {calendar.provider}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

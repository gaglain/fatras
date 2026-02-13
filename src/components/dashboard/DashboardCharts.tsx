import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

const chartConfig = {
  events: {
    label: "Événements",
    color: "hsl(var(--primary))",
  },
  contacts: {
    label: "Contacts",
    color: "hsl(var(--secondary))",
  },
  quotes: {
    label: "Devis",
    color: "hsl(var(--accent))",
  },
  revenue: {
    label: "Revenus",
    color: "hsl(var(--chart-1))",
  },
};

interface DashboardChartsProps {
  selectedArtist: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ selectedArtist }) => {
  // Données pour le graphique de revenus mensuels
  const { data: monthlyRevenue = [] } = useQuery({
    queryKey: ['dashboard-monthly-revenue', selectedArtist],
    queryFn: async () => {
      try {
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const start = startOfMonth(date);
          const end = endOfMonth(date);
          
          let query = supabase
            .from('quotes')
            .select('total_amount, created_at, events!inner(artist_id)')
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .eq('status', 'accepted');
          
          if (selectedArtist !== 'all') {
            query = query.eq('events.artist_id', selectedArtist);
          }
          
          const { data: quotes, error } = await query;
          
          const total = (error ? [] : quotes || []).reduce((sum, quote) => sum + (Number(quote.total_amount) || 0), 0);
          
          months.push({
            month: format(date, 'MMM'),
            revenue: total,
          });
        }
        return months;
      } catch (e) {
        console.warn('Monthly revenue query failed:', e);
        return [];
      }
    }
  });

  // Données pour l'activité hebdomadaire
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['dashboard-weekly-activity', selectedArtist],
    queryFn: async () => {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const weekData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        // Compter les événements du jour
        let eventsQuery = supabase
          .from('events')
          .select('id')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());
        
        if (selectedArtist !== 'all') {
          eventsQuery = eventsQuery.eq('artist_id', selectedArtist);
        }
        
        const { data: events } = await eventsQuery;
          
        // Compter les contacts du jour
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());
        
        weekData.push({
          day: days[i],
          events: events?.length || 0,
          contacts: contacts?.length || 0,
        });
      }
      
      return weekData;
    }
  });

  // Données pour la répartition des statuts d'événements
  const { data: eventStatus = [] } = useQuery({
    queryKey: ['dashboard-event-status', selectedArtist],
    queryFn: async () => {
      try {
        let query = supabase.from('events').select('status');
        
        if (selectedArtist !== 'all') {
          query = query.eq('artist_id', selectedArtist);
        }
        
        const { data: events, error } = await query;
        
        if (error) return [];
        
        const statusCount = events?.reduce((acc, event) => {
          acc[event.status || 'unknown'] = (acc[event.status || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        return Object.entries(statusCount).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          fill: status === 'confirmed' ? 'hsl(var(--chart-1))' : 
                status === 'pending' ? 'hsl(var(--chart-2))' : 
                'hsl(var(--chart-3))'
        }));
      } catch (e) {
        console.warn('Event status query failed:', e);
        return [];
      }
    }
  });

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1">
      {/* Revenus mensuels */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">Revenus Mensuels</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`€${Number(value).toLocaleString('fr-FR')}`, 'Revenus']}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary)/0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Activité hebdomadaire */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">Activité Hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />} 
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contacts" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
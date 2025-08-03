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

export const DashboardCharts: React.FC = () => {
  // Données pour le graphique de revenus mensuels
  const { data: monthlyRevenue = [] } = useQuery({
    queryKey: ['dashboard-monthly-revenue'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        
        const { data: quotes, error } = await supabase
          .from('quotes')
          .select('total_amount, created_at')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .eq('status', 'accepted');
        
        if (error) throw error;
        
        const total = quotes?.reduce((sum, quote) => sum + (Number(quote.total_amount) || 0), 0) || 0;
        
        months.push({
          month: format(date, 'MMM'),
          revenue: total,
        });
      }
      return months;
    }
  });

  // Données pour l'activité hebdomadaire
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['dashboard-weekly-activity'],
    queryFn: async () => {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const weekData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        // Compter les événements du jour
        const { data: events } = await supabase
          .from('events')
          .select('id')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());
          
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
    queryKey: ['dashboard-event-status'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('status');
      
      if (error) throw error;
      
      const statusCount = events?.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      return Object.entries(statusCount).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        fill: status === 'confirmed' ? 'hsl(var(--chart-1))' : 
              status === 'pending' ? 'hsl(var(--chart-2))' : 
              'hsl(var(--chart-3))'
      }));
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenus mensuels */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus Mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`€${Number(value).toLocaleString('fr-FR')}`, 'Revenus']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary)/0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Activité hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contacts" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Statuts des événements */}
      <Card>
        <CardHeader>
          <CardTitle>Statuts des Événements</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={eventStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {eventStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [value, name]}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance mensuelle détaillée */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`€${Number(value).toLocaleString('fr-FR')}`, 'Revenus']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
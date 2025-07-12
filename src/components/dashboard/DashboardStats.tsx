
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DashboardStats: React.FC = () => {
  // Récupération des données réelles depuis Supabase
  const { data: contacts = [] } = useQuery({
    queryKey: ['dashboard-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: events = [] } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['dashboard-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculs basés sur les vraies données
  const thisMonthEvents = events.filter(e => {
    if (!e.start_date) return false;
    const eventDate = new Date(e.start_date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;

  const monthlyRevenue = quotes.reduce((total, quote) => total + (Number(quote.total_amount) || 0), 0);

  const stats = [
    {
      title: 'Contacts',
      value: contacts.length.toString(),
      icon: Users,
      description: 'Contacts actifs',
      color: 'text-blue-600'
    },
    {
      title: 'Événements',
      value: thisMonthEvents.toString(),
      icon: Calendar,
      description: 'Ce mois',
      color: 'text-green-600'
    },
    {
      title: 'Devis',
      value: quotes.length.toString(),
      icon: FileText,
      description: 'En attente',
      color: 'text-orange-600'
    },
    {
      title: 'Revenus',
      value: `€${monthlyRevenue.toLocaleString('fr-FR')}`,
      icon: TrendingUp,
      description: 'Total devis',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{
              color: 'var(--custom-cardText, #18181b)'
            }}>
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{
              color: 'var(--custom-cardText, #18181b)'
            }}>
              {stat.value}
            </div>
            <p className="text-xs" style={{
              color: 'var(--custom-text, #666666)'
            }}>
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStatsProps {
  selectedArtist: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ selectedArtist }) => {
  // Récupération des données réelles depuis Supabase avec refetch automatique
  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ['dashboard-contacts', selectedArtist],
    queryFn: async () => {
      let query = supabase.from('contacts').select('*');
      
      if (selectedArtist !== 'all') {
        // Filtrer les contacts liés à l'artiste via la table contact_artists
        const { data: contactArtists } = await supabase
          .from('contact_artists')
          .select('contact_id')
          .eq('artist_id', selectedArtist);
        
        const contactIds = contactArtists?.map(ca => ca.contact_id) || [];
        if (contactIds.length > 0) {
          query = query.in('id', contactIds);
        } else {
          return [];
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['dashboard-events', selectedArtist],
    queryFn: async () => {
      let query = supabase.from('events').select('*');
      
      if (selectedArtist !== 'all') {
        query = query.eq('artist_id', selectedArtist);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: quotes = [], refetch: refetchQuotes } = useQuery({
    queryKey: ['dashboard-quotes', selectedArtist],
    queryFn: async () => {
      let query = supabase.from('quotes').select('*, events!inner(artist_id)');
      
      if (selectedArtist !== 'all') {
        query = query.eq('events.artist_id', selectedArtist);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['dashboard-opportunities', selectedArtist],
    queryFn: async () => {
      let query = supabase.from('opportunities').select('*');
      
      if (selectedArtist !== 'all') {
        // Filtrer les opportunités liées à l'artiste via artist_opportunities
        const { data: artistOpps } = await supabase
          .from('artist_opportunities')
          .select('opportunity_id')
          .eq('artist_id', selectedArtist);
        
        const oppIds = artistOpps?.map(ao => ao.opportunity_id) || [];
        if (oppIds.length > 0) {
          query = query.in('id', oppIds);
        } else {
          return [];
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Calculs basés sur les vraies données avec opportunités
  // Ne compter que les événements confirmés pour "Ce mois"
  const thisMonthEvents = events.filter(e => {
    if (!e.start_date) return false;
    if (e.status !== 'confirmed') return false;
    const eventDate = new Date(e.start_date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;

  const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((total, quote) => total + (Number(quote.total_amount) || 0), 0);
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'draft').length;
  const totalOpportunities = opportunities.length;

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
      title: 'Opportunités',
      value: totalOpportunities.toString(),
      icon: TrendingUp,
      description: 'Total opportunités',
      color: 'text-purple-600'
    },
    {
      title: 'Revenus',
      value: `€${totalRevenue.toLocaleString('fr-FR')}`,
      icon: FileText,
      description: 'Devis acceptés',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-elegant transition-all duration-300 border-border bg-card animate-fade-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

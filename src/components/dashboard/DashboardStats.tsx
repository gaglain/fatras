
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, TrendingUp, Target, CheckCircle } from 'lucide-react';
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
      try {
        let query = supabase.from('quotes').select('*, events!inner(artist_id)');
        
        if (selectedArtist !== 'all') {
          query = query.eq('events.artist_id', selectedArtist);
        }
        
        const { data, error } = await query;
        if (error) {
          console.warn('Error fetching quotes:', error.message);
          return [];
        }
        return data || [];
      } catch (e) {
        console.warn('Quotes query failed:', e);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['dashboard-opportunities', selectedArtist],
    queryFn: async () => {
      let query = supabase.from('opportunities').select('*');
      
      if (selectedArtist !== 'all') {
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

  // Calculs basés sur les vraies données
  const thisMonthEvents = events.filter(e => {
    if (!e.start_date) return false;
    if (e.status !== 'confirmed') return false;
    const eventDate = new Date(e.start_date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;

  const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const revenueTTC = acceptedQuotes.reduce((total, quote) => total + (Number(quote.total_amount) || 0), 0);
  const revenueHT = acceptedQuotes.reduce((total, quote) => total + ((Number(quote.total_amount) || 0) - (Number(quote.tax_amount) || 0)), 0);
  const avgRevenuePerShow = confirmedEvents > 0 ? revenueHT / confirmedEvents : 0;
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'draft').length;
  
  // Opportunités : exclure les "lost"
  const activeOpportunities = opportunities.filter(o => o.status !== 'lost');
  const wonOpportunities = opportunities.filter(o => o.status === 'won');
  const openOpportunities = opportunities.filter(o => o.status === 'open');
  const appliedOpportunities = opportunities.filter(o => o.status === 'applied');
  const wonBudget = wonOpportunities.reduce((sum, o) => sum + (Number(o.budget) || 0), 0);
  const activeBudget = activeOpportunities.reduce((sum, o) => sum + (Number(o.budget) || 0), 0);

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
      description: 'Ce mois (confirmés)',
      color: 'text-green-600'
    },
    {
      title: 'Opportunités actives',
      value: `${openOpportunities.length + appliedOpportunities.length}`,
      icon: Target,
      description: `${openOpportunities.length} ouvertes · ${appliedOpportunities.length} postulées`,
      color: 'text-purple-600'
    },
    {
      title: 'Opportunités gagnées',
      value: `${wonOpportunities.length}`,
      icon: CheckCircle,
      description: `Budget: ${wonBudget.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      color: 'text-green-600'
    },
    {
      title: 'Revenus HT',
      value: `${revenueHT.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      icon: FileText,
      description: `TTC: ${revenueTTC.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      color: 'text-orange-600'
    },
    {
      title: 'Moy./représentation',
      value: `${avgRevenuePerShow.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
      icon: TrendingUp,
      description: `${confirmedEvents} dates confirmées`,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
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

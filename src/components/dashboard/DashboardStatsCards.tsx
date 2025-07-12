
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Music, Euro, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DashboardStatsCards: React.FC = () => {
  const navigate = useNavigate();

  // Récupération des contacts depuis Supabase
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        return [];
      }
      return data || [];
    }
  });

  // Récupération des événements depuis Supabase
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      
      if (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return [];
      }
      return data || [];
    }
  });

  // Récupération des campagnes email depuis Supabase
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'sent');
      
      if (error) {
        console.error('Erreur lors du chargement des campagnes:', error);
        return [];
      }
      return data || [];
    }
  });

  // Récupération des devis depuis Supabase
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .in('status', ['pending', 'in_progress']);
      
      if (error) {
        console.error('Erreur lors du chargement des devis:', error);
        return [];
      }
      return data || [];
    }
  });

  // Calculs des statistiques en temps réel avec les vraies données
  const activeContacts = contacts.length;
  const thisMonthEvents = events.filter(e => {
    if (!e.start_date) return false;
    const eventDate = new Date(e.start_date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;
  
  const pendingTasks = quotes.length; // Les devis en cours comme tâches
  const activeArtists = contacts.filter(c => c.role === 'artist').length;
  const sentCampaigns = campaigns.length;
  
  // Calcul du revenu total des devis
  const revenue = quotes.reduce((total, quote) => total + (Number(quote.total_amount) || 0), 0);

  const stats = [
    { 
      name: 'Total Contacts', 
      value: activeContacts.toString(), 
      icon: Users, 
      change: activeContacts > 0 ? '+12%' : '0%', 
      changeType: 'positive' as const,
      route: '/contacts'
    },
    { 
      name: 'Événements ce mois', 
      value: thisMonthEvents.toString(), 
      icon: Calendar, 
      change: thisMonthEvents > 0 ? '+5%' : '0%', 
      changeType: 'positive' as const,
      route: '/events'
    },
    { 
      name: 'Devis en cours', 
      value: pendingTasks.toString(), 
      icon: CheckSquare, 
      change: pendingTasks > 0 ? '-8%' : '0%', 
      changeType: pendingTasks > 10 ? 'negative' as const : 'positive' as const,
      route: '/contracts'
    },
    { 
      name: 'Artistes actifs', 
      value: activeArtists.toString(), 
      icon: Music, 
      change: activeArtists > 0 ? '+2%' : '0%', 
      changeType: 'positive' as const,
      route: '/artists'
    },
    { 
      name: 'Revenus', 
      value: `${revenue.toLocaleString('fr-FR')}€`, 
      icon: Euro, 
      change: revenue > 0 ? '+15%' : '0%', 
      changeType: 'positive' as const,
      route: '/contracts'
    },
    { 
      name: 'Campagnes email', 
      value: sentCampaigns.toString(), 
      icon: Mail, 
      change: sentCampaigns > 0 ? '+3%' : '0%', 
      changeType: 'positive' as const,
      route: '/email-campaigns'
    },
  ];

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.name} 
            className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer" 
            style={{
              background: `rgb(var(--custom-cardBg))`,
              color: `rgb(var(--custom-cardText))`,
              border: `1px solid rgba(var(--custom-buttonBg), 0.2)`
            }}
            onClick={() => handleCardClick(stat.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{
                    color: `rgba(var(--custom-text), 0.7)`
                  }}>
                    {stat.name}
                  </p>
                  <p className="text-lg font-bold" style={{
                    color: `rgb(var(--custom-cardText))`
                  }}>
                    {stat.value}
                  </p>
                  <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{
                  background: `rgba(var(--custom-buttonBg), 0.1)`
                }}>
                  <Icon className="h-4 w-4" style={{
                    color: `rgb(var(--custom-buttonBg))`
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

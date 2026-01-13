
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
        .select('*');
      
      if (error) {
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
        .from('email_campaigns')
        .select('*');
      
      if (error) {
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
        .select('*');
      
      if (error) {
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
  
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'draft').length;
  const activeArtists = contacts.filter(c => c.role === 'artist').length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
  
  // Calcul du revenu total des devis acceptés
  const revenue = quotes.filter(q => q.status === 'accepted').reduce((total, quote) => total + (Number(quote.total_amount) || 0), 0);

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
      value: pendingQuotes.toString(), 
      icon: CheckSquare, 
      change: pendingQuotes > 0 ? '-8%' : '0%', 
      changeType: pendingQuotes > 10 ? 'negative' as const : 'positive' as const,
      route: '/quotes'
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
      route: '/quotes'
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-[10px] sm:text-xs font-medium mb-1 truncate" style={{
                    color: `rgba(var(--custom-text), 0.7)`
                  }}>
                    {stat.name}
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-bold truncate" style={{
                    color: `rgb(var(--custom-cardText))`
                  }}>
                    {stat.value}
                  </p>
                  <p className={`text-[10px] sm:text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{
                  background: `rgba(var(--custom-buttonBg), 0.1)`
                }}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" style={{
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

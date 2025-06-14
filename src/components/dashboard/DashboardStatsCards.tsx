
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Music, Euro, Mail } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { useNavigate } from 'react-router-dom';

export const DashboardStatsCards: React.FC = () => {
  const { contacts, events, tasks, contracts, emailCampaigns, revenue } = useAppData();
  const navigate = useNavigate();

  // Calculs des statistiques en temps réel
  const activeContacts = contacts.filter(c => c.status === 'active').length;
  const thisMonthEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const activeArtists = contacts.filter(c => c.type === 'artist' && c.status === 'active').length;
  const sentCampaigns = emailCampaigns.filter(c => c.status === 'sent').length;

  const stats = [
    { 
      name: 'Total Contacts', 
      value: activeContacts.toString(), 
      icon: Users, 
      change: contacts.length > 0 ? '+12%' : '0%', 
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
      name: 'Tâches en cours', 
      value: pendingTasks.toString(), 
      icon: CheckSquare, 
      change: pendingTasks > 0 ? '-8%' : '0%', 
      changeType: pendingTasks > 10 ? 'negative' as const : 'positive' as const,
      route: '/tasks'
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
      name: 'Revenus ce mois', 
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

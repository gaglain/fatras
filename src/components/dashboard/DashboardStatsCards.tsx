
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Music, Euro, Mail } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';

export const DashboardStatsCards: React.FC = () => {
  const { contacts, events, tasks, contracts, emailCampaigns, revenue } = useAppData();

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
      changeType: 'positive' as const 
    },
    { 
      name: 'Événements ce mois', 
      value: thisMonthEvents.toString(), 
      icon: Calendar, 
      change: thisMonthEvents > 0 ? '+5%' : '0%', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Tâches en cours', 
      value: pendingTasks.toString(), 
      icon: CheckSquare, 
      change: pendingTasks > 0 ? '-8%' : '0%', 
      changeType: pendingTasks > 10 ? 'negative' as const : 'positive' as const 
    },
    { 
      name: 'Artistes actifs', 
      value: activeArtists.toString(), 
      icon: Music, 
      change: activeArtists > 0 ? '+2%' : '0%', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Revenus ce mois', 
      value: `${revenue.toLocaleString('fr-FR')}€`, 
      icon: Euro, 
      change: revenue > 0 ? '+15%' : '0%', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Campagnes email', 
      value: sentCampaigns.toString(), 
      icon: Mail, 
      change: sentCampaigns > 0 ? '+3%' : '0%', 
      changeType: 'positive' as const 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer" style={{
            background: 'var(--custom-cardBg, #ffffff)',
            color: 'var(--custom-cardText, #18181b)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '0'
          }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{
                    color: 'var(--custom-text, #666666)'
                  }}>
                    {stat.name}
                  </p>
                  <p className="text-lg font-bold" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    {stat.value}
                  </p>
                  <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-2" style={{
                  background: 'var(--custom-buttonBg, #1632f4)',
                  opacity: 0.1,
                  borderRadius: '0'
                }}>
                  <Icon className="h-4 w-4" style={{
                    color: 'var(--custom-buttonBg, #1632f4)'
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

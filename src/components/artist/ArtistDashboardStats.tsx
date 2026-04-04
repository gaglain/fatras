import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, DollarSign, CheckSquare, Mail } from 'lucide-react';

interface DashboardStats {
  contacts: number;
  quotes: number;
  opportunities: number;
  tasks: number;
  events: number;
  publications: number;
  contactLists: number;
  campaigns: number;
}

interface ArtistDashboardStatsProps {
  stats: DashboardStats;
}

export const ArtistDashboardStats: React.FC<ArtistDashboardStatsProps> = ({ stats }) => {
  const items = [
    { label: 'Contacts', value: stats.contacts, icon: Users, desc: 'Contacts liés au spectacle' },
    { label: 'Opportunités', value: stats.opportunities, icon: DollarSign, desc: 'Opportunités en cours' },
    { label: 'Devis', value: stats.quotes, icon: FileText, desc: 'Devis créés' },
    { label: 'Événements', value: stats.events, icon: Calendar, desc: 'Événements planifiés' },
    { label: 'Tâches', value: stats.tasks, icon: CheckSquare, desc: 'Tâches en cours' },
    { label: 'Publications', value: stats.publications, icon: Mail, desc: 'Publications planifiées' },
    { label: 'Listes de contacts', value: stats.contactLists, icon: Users, desc: 'Listes dédiées' },
    { label: 'Campagnes email', value: stats.campaigns, icon: Mail, desc: 'Campagnes créées' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value, icon: Icon, desc }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Music, Euro, Mail } from 'lucide-react';

const stats = [
  { name: 'Total Contacts', value: '2,847', icon: Users, change: '+12%', changeType: 'positive' as const },
  { name: 'Événements ce mois', value: '23', icon: Calendar, change: '+5%', changeType: 'positive' as const },
  { name: 'Tâches en cours', value: '47', icon: CheckSquare, change: '-8%', changeType: 'negative' as const },
  { name: 'Artistes actifs', value: '12', icon: Music, change: '+2%', changeType: 'positive' as const },
  { name: 'Revenus ce mois', value: '48,500€', icon: Euro, change: '+15%', changeType: 'positive' as const },
  { name: 'Campagnes email', value: '8', icon: Mail, change: '+3%', changeType: 'positive' as const },
];

export const DashboardStatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} className="bg-white border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-brand-primary/10 p-2 rounded-lg">
                  <Icon className="h-4 w-4 text-brand-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

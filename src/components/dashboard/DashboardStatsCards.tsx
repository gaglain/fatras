
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
          <Card key={stat.name} className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer" style={{
            background: 'var(--custom-cardBg, #ffffff)',
            color: 'var(--custom-cardText, #18181b)',
            border: '1px solid rgba(0,0,0,0.1)'
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
                <div className="p-2 rounded-lg" style={{
                  background: 'var(--custom-buttonBg, #1632f4)',
                  opacity: 0.1
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

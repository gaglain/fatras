
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Contacts',
      value: '24',
      icon: Users,
      description: 'Contacts actifs',
      color: 'text-blue-600'
    },
    {
      title: 'Événements',
      value: '8',
      icon: Calendar,
      description: 'Ce mois',
      color: 'text-green-600'
    },
    {
      title: 'Devis',
      value: '12',
      icon: FileText,
      description: 'En attente',
      color: 'text-orange-600'
    },
    {
      title: 'Revenus',
      value: '€15,240',
      icon: TrendingUp,
      description: 'Ce mois',
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


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const recentActivities = [
  { 
    type: 'contact', 
    title: 'Nouveau contact',
    message: 'John Smith - Responsable de salle', 
    time: '2 minutes',
    status: 'new',
    priority: 'high'
  },
  { 
    type: 'event', 
    title: 'Événement mis à jour',
    message: 'Festival d\'été 2024 - Dates confirmées', 
    time: '15 minutes',
    status: 'updated',
    priority: 'medium'
  },
  { 
    type: 'contract', 
    title: 'Contrat signé',
    message: 'Madison Square Garden - The Midnight Express', 
    time: '1 heure',
    status: 'signed',
    priority: 'high'
  },
  { 
    type: 'tour', 
    title: 'Tournée programmée',
    message: 'Dates ajoutées pour Sarah Mitchell', 
    time: '2 heures',
    status: 'scheduled',
    priority: 'medium'
  },
  { 
    type: 'email', 
    title: 'Campagne envoyée',
    message: 'Newsletter mars 2024 - 1,247 destinataires', 
    time: '3 heures',
    status: 'sent',
    priority: 'low'
  },
];

export const RecentActivityCard: React.FC = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="xl:col-span-1 hover:shadow-md transition-shadow" style={{
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center" style={{
          color: 'var(--custom-cardText, #18181b)'
        }}>
          <Activity className="h-5 w-5 mr-2" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 rounded-lg transition-colors hover:bg-black hover:bg-opacity-5" style={{
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <div className="w-2 h-2 rounded-full mt-2" style={{
                background: 'var(--custom-buttonBg, #1632f4)'
              }}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    {activity.title}
                  </p>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
                <p className="text-xs mb-1" style={{
                  color: 'var(--custom-text, #666666)'
                }}>
                  {activity.message}
                </p>
                <p className="text-xs" style={{
                  color: 'var(--custom-text, #999999)'
                }}>
                  Il y a {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

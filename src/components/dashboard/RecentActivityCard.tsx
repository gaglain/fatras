
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
    <Card className="xl:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <Activity className="h-5 w-5 mr-2" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <Badge className={getPriorityColor(activity.priority)}>
                    {activity.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{activity.message}</p>
                <p className="text-xs text-gray-500">Il y a {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

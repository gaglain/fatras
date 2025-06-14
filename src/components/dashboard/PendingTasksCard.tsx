
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock } from 'lucide-react';

const pendingTasks = [
  { id: '1', title: 'Révision contrat Olympia', priority: 'high', deadline: '2024-07-10' },
  { id: '2', title: 'Préparation technique festival', priority: 'medium', deadline: '2024-07-15' },
  { id: '3', title: 'Suivi partenaires merchandising', priority: 'low', deadline: '2024-07-20' },
  { id: '4', title: 'Validation rider technique', priority: 'high', deadline: '2024-07-08' },
];

export const PendingTasksCard: React.FC = () => {
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
          <CheckSquare className="h-5 w-5 mr-2" />
          Tâches Prioritaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                Échéance: {new Date(task.deadline).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

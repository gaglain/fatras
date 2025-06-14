
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
    <Card className="xl:col-span-1 hover:shadow-md transition-shadow" style={{
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center" style={{
          color: 'var(--custom-cardText, #18181b)'
        }}>
          <CheckSquare className="h-5 w-5 mr-2" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
          Tâches Prioritaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div key={task.id} className="p-3 rounded-lg transition-colors" style={{
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium" style={{
                  color: 'var(--custom-cardText, #18181b)'
                }}>
                  {task.title}
                </h4>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center text-xs" style={{
                color: 'var(--custom-text, #666666)'
              }}>
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

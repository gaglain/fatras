
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';

interface TaskNotificationProps {
  pendingCount: number;
}

export const TaskNotification: React.FC<TaskNotificationProps> = ({ pendingCount }) => {
  if (pendingCount === 0) return null;

  return (
    <div className="relative">
      <CheckSquare className="h-5 w-5" />
      <Badge 
        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
      >
        {pendingCount > 99 ? '99+' : pendingCount}
      </Badge>
    </div>
  );
};

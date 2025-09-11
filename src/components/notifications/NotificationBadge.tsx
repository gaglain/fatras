import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className = '', 
  maxCount = 99 
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div 
      className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center 
                  bg-red-500 text-white text-xs font-bold rounded-full 
                  border-2 border-white dark:border-gray-900 
                  animate-pulse shadow-lg z-10 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
      }}
    >
      {displayCount}
    </div>
  );
};
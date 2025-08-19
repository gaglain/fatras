
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';

export const RealtimeIndicator: React.FC = () => {
  const { isConnected } = useRealtime();

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center space-x-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Temps réel</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Hors ligne</span>
        </>
      )}
    </Badge>
  );
};

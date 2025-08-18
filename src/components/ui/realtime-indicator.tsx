import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

// Wrapper sécurisé pour le RealtimeIndicator
export const RealtimeIndicator: React.FC = () => {
  // Version simple qui affiche toujours "hors ligne" pour éviter l'erreur
  // Sera mis à jour quand tous les contextes seront stables
  return (
    <Badge 
      variant="secondary"
      className="flex items-center space-x-1 text-xs"
    >
      <WifiOff className="h-3 w-3" />
      <span>Hors ligne</span>
    </Badge>
  );
};

// Version avec contexte (à utiliser plus tard)
export const RealtimeIndicatorWithContext: React.FC = () => {
  try {
    const { useRealtime } = require('@/contexts/RealtimeContext');
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
  } catch (error) {
    return (
      <Badge 
        variant="secondary"
        className="flex items-center space-x-1 text-xs"
      >
        <WifiOff className="h-3 w-3" />
        <span>Hors ligne</span>
      </Badge>
    );
  }
};
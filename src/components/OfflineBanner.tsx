import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-md"
         style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
      <WifiOff className="h-4 w-4" />
      Vous êtes hors-ligne — les données affichées peuvent ne pas être à jour
    </div>
  );
};

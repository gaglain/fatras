
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface RealtimeContextType {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Configuration des mises à jour temps réel désactivée temporairement
  // useRealtimeUpdates([
  //   {
  //     table: 'contacts',
  //     onInsert: (payload) => {
  //       console.log('Nouveau contact ajouté:', payload.new);
  //       window.dispatchEvent(new CustomEvent('contactsChanged', { detail: payload.new }));
  //     },
  //     onUpdate: (payload) => {
  //       console.log('Contact modifié:', payload.new);
  //       window.dispatchEvent(new CustomEvent('contactsChanged', { detail: payload.new }));
  //     },
  //     onDelete: (payload) => {
  //       console.log('Contact supprimé:', payload.old);
  //       window.dispatchEvent(new CustomEvent('contactsChanged', { detail: payload.old }));
  //     }
  //   },
  //   {
  //     table: 'events',
  //     onInsert: (payload) => {
  //       console.log('Nouvel événement ajouté:', payload.new);
  //       window.dispatchEvent(new CustomEvent('eventsChanged', { detail: payload.new }));
  //     },
  //     onUpdate: (payload) => {
  //       console.log('Événement modifié:', payload.new);
  //       window.dispatchEvent(new CustomEvent('eventsChanged', { detail: payload.new }));
  //     },
  //     onDelete: (payload) => {
  //       console.log('Événement supprimé:', payload.old);
  //       window.dispatchEvent(new CustomEvent('eventsChanged', { detail: payload.old }));
  //     }
  //   }
  // ]);

  useEffect(() => {
    // Simuler une connexion temps réel
    setIsConnected(true);
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

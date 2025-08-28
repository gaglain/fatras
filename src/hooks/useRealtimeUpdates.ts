
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeConfig {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeUpdates = (configs: RealtimeConfig[]) => {
  const channelsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // Nettoyer les anciens canaux
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current.clear();

    // Créer de nouveaux canaux
    configs.forEach(config => {
      const channelName = `realtime-${config.table}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: config.table
        }, (payload) => {
          console.log(`INSERT on ${config.table}:`, payload);
          config.onInsert?.(payload);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: config.table
        }, (payload) => {
          console.log(`UPDATE on ${config.table}:`, payload);
          config.onUpdate?.(payload);
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: config.table
        }, (payload) => {
          console.log(`DELETE on ${config.table}:`, payload);
          config.onDelete?.(payload);
        })
        .subscribe();

      channelsRef.current.set(channelName, channel);
    });

    // Fonction de nettoyage
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [configs]);
};

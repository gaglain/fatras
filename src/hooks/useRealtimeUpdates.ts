
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeConfig {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeUpdates = (configs: RealtimeConfig[]) => {
  const setupRealtimeListeners = useCallback(() => {
    const channels = configs.map(config => {
      const channel = supabase
        .channel(`realtime-${config.table}`)
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

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [configs]);

  useEffect(() => {
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [setupRealtimeListeners]);
};

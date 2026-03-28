import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface RealtimeConfig {
  table: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

/**
 * Stable realtime subscription hook.
 * Uses deterministic channel names (no Date.now/Math.random) to prevent connection leaks.
 * Only re-subscribes when the set of watched tables actually changes.
 */
export const useRealtimeUpdates = (configs: RealtimeConfig[]) => {
  // Store latest callbacks in a ref so channels don't need to re-subscribe
  const configsRef = useRef<RealtimeConfig[]>(configs);
  configsRef.current = configs;

  // Stable key based on table names
  const tablesKey = configs.map(c => c.table).sort().join(',');

  useEffect(() => {
    if (!tablesKey) return;

    const channelName = `rt-${tablesKey.replace(/,/g, '-')}`;

    let channel = supabase.channel(channelName);

    configsRef.current.forEach((config) => {
      channel = channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: config.table,
        }, (payload) => {
          const current = configsRef.current.find(c => c.table === config.table);
          current?.onInsert?.(payload);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: config.table,
        }, (payload) => {
          const current = configsRef.current.find(c => c.table === config.table);
          current?.onUpdate?.(payload);
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: config.table,
        }, (payload) => {
          const current = configsRef.current.find(c => c.table === config.table);
          current?.onDelete?.(payload);
        });
    });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        logger.warn(`Realtime channel error for: ${tablesKey}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tablesKey]);
};

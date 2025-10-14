
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
  const configsStringRef = useRef<string>('');

  useEffect(() => {
    // Créer une clé stable basée sur les tables surveillées
    const configsString = configs.map(c => c.table).sort().join(',');
    
    // Ne rien faire si la configuration n'a pas changé
    if (configsString === configsStringRef.current && channelsRef.current.size > 0) {
      return;
    }
    
    configsStringRef.current = configsString;

    // Nettoyer les anciens canaux de manière asynchrone
    const cleanup = async () => {
      const oldChannels = Array.from(channelsRef.current.values());
      channelsRef.current.clear();
      
      for (const channel of oldChannels) {
        try {
          await supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Erreur lors de la suppression du canal:', error);
        }
      }
    };

    cleanup().then(() => {
      // Créer de nouveaux canaux après nettoyage
      configs.forEach((config, index) => {
        const channelName = `realtime-${config.table}-${Date.now()}-${index}`;
        
        try {
          const channel = supabase
            .channel(channelName)
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: config.table
            }, (payload) => {
              config.onInsert?.(payload);
            })
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: config.table
            }, (payload) => {
              config.onUpdate?.(payload);
            })
            .on('postgres_changes', {
              event: 'DELETE',
              schema: 'public',
              table: config.table
            }, (payload) => {
              config.onDelete?.(payload);
            })
            .subscribe();

          channelsRef.current.set(channelName, channel);
        } catch (error) {
          console.error(`Erreur lors de la création du canal pour ${config.table}:`, error);
        }
      });
    });

    // Fonction de nettoyage
    return () => {
      const channels = Array.from(channelsRef.current.values());
      channelsRef.current.clear();
      
      channels.forEach(channel => {
        supabase.removeChannel(channel).catch(err => {
          console.warn('Erreur lors du nettoyage du canal:', err);
        });
      });
    };
  }, [configs.map(c => c.table).join(',')]);
};

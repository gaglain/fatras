import { useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

export const useEmailSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const syncEmails = async (forceSyncSince?: string) => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const body: Record<string, string> = { userId: user.id, action: 'sync' };
      if (forceSyncSince) body.forceSyncSince = forceSyncSince;

      const result = await invokeEdgeFunction<{ success: boolean; syncedCount?: number; error?: string }>({
        functionName: 'sync-imap-emails',
        body,
      });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Échec de la synchronisation');
      }

      toast.success(`${result.data.syncedCount} nouveaux emails synchronisés`);
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Error in email sync:', error);
      toast.error(`Erreur lors de la synchronisation: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testImapConnection = async () => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const result = await invokeEdgeFunction<{ success: boolean; error?: string }>({
        functionName: 'sync-imap-emails',
        body: { userId: user.id, action: 'test_connection' },
      });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Test de connexion échoué');
      }

      toast.success('Connexion IMAP réussie !');
      return result.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Error in IMAP test:', error);
      toast.error(`Erreur de connexion IMAP: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { syncEmails, testImapConnection, isLoading };
};

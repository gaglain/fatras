import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useEmailSync = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const syncEmails = async () => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug('Starting email sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-imap-emails', {
        body: {
          userId: user.id,
          action: 'sync'
        }
      });

      if (error) {
        logger.error('Email sync error:', error);
        throw error;
      }

      logger.debug('Email sync result:', data);
      
      if (data.success) {
        toast.success(`${data.syncedCount} nouveaux emails synchronisés`);
        return data;
      } else {
        throw new Error(data.error || 'Échec de la synchronisation');
      }
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
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug('Testing IMAP connection...');
      
      const { data, error } = await supabase.functions.invoke('sync-imap-emails', {
        body: {
          userId: user.id,
          action: 'test_connection'
        }
      });

      if (error) {
        logger.error('IMAP test error:', error);
        throw error;
      }

      logger.debug('IMAP test result:', data);
      
      if (data.success) {
        toast.success('Connexion IMAP réussie !');
        return data;
      } else {
        throw new Error(data.error || 'Test de connexion échoué');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Error in IMAP test:', error);
      toast.error(`Erreur de connexion IMAP: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncEmails,
    testImapConnection,
    isLoading
  };
};
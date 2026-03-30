import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

interface SyncResult {
  success: boolean;
  google_event_id?: string;
  message?: string;
  error?: string;
}

export const useGoogleCalendarSync = () => {
  const [isLoading, setIsLoading] = useState(false);

  const syncEventToCalendar = async (
    eventId: string,
    attendeeEmails?: string[]
  ): Promise<SyncResult> => {
    setIsLoading(true);
    try {
      const result = await invokeEdgeFunction<SyncResult>({
        functionName: 'sync-google-calendar',
        body: { action: 'sync_event', event_id: eventId, attendee_emails: attendeeEmails },
      });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Erreur inconnue');
      }

      toast.success(result.data.message || 'Événement synchronisé avec Google Calendar');
      return result.data;
    } catch (error: unknown) {
      logger.error('Erreur sync Google Calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEventFromCalendar = async (eventId: string): Promise<SyncResult> => {
    setIsLoading(true);
    try {
      const result = await invokeEdgeFunction<SyncResult>({
        functionName: 'sync-google-calendar',
        body: { action: 'delete_event', event_id: eventId },
      });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Erreur inconnue');
      }

      toast.success('Événement supprimé de Google Calendar');
      return result.data;
    } catch (error: unknown) {
      logger.error('Erreur suppression Google Calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const listCalendars = async () => {
    try {
      const result = await invokeEdgeFunction<{ calendars?: unknown[] }>({
        functionName: 'sync-google-calendar',
        body: { action: 'list_calendars' },
        nonBlocking: true,
      });
      return result.data?.calendars || [];
    } catch (error) {
      logger.error('Erreur liste calendriers:', error);
      return [];
    }
  };

  return {
    isLoading,
    syncEventToCalendar,
    deleteEventFromCalendar,
    listCalendars
  };
};

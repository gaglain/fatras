import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'sync_event',
          event_id: eventId,
          attendee_emails: attendeeEmails
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || 'Événement synchronisé avec Google Calendar');
        return data;
      } else {
        throw new Error(data.error);
      }
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
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'delete_event',
          event_id: eventId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Événement supprimé de Google Calendar');
        return data;
      } else {
        throw new Error(data.error);
      }
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
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: { action: 'list_calendars' }
      });

      if (error) throw error;
      return data.calendars || [];
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

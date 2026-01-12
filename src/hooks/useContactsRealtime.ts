import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status: 'prospect' | 'client' | 'inactive';
  source?: string;
  notes?: string;
  tags: string[];
  accepts_marketing_emails: boolean;
  created_at: string;
  updated_at?: string;
}

interface UseContactsRealtimeProps {
  onContactAdded?: (contact: Contact) => void;
  onContactUpdated?: (contact: Contact) => void;
  onContactDeleted?: (contactId: string) => void;
  enabled?: boolean;
}

export const useContactsRealtime = ({
  onContactAdded,
  onContactUpdated,
  onContactDeleted,
  enabled = true
}: UseContactsRealtimeProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!enabled) return;

    // Nettoyer l'ancien canal s'il existe avec délai
    if (channelRef.current) {
      logger.debug('Cleaning up previous contacts channel');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (err) {
        logger.warn('Warning during channel cleanup:', err);
      }
      channelRef.current = null;
    }

    // Clear any pending cleanup
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }

    logger.debug('Setting up contacts real-time sync');

    const channel = supabase
      .channel(`contacts-rt-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        logger.debug('Contact added via real-time:', payload.new);
        if (onContactAdded && payload.new) {
          const newContact = {
            ...payload.new,
            tags: payload.new.tags || [],
            accepts_marketing_emails: payload.new.accepts_marketing_emails ?? true
          } as Contact;
          onContactAdded(newContact);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        logger.debug('Contact updated via real-time:', payload.new);
        if (onContactUpdated && payload.new) {
          const updatedContact = {
            ...payload.new,
            tags: payload.new.tags || [],
            accepts_marketing_emails: payload.new.accepts_marketing_emails ?? true
          } as Contact;
          onContactUpdated(updatedContact);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        logger.debug('Contact deleted via real-time:', payload.old?.id);
        if (onContactDeleted && payload.old?.id) {
          onContactDeleted(payload.old.id);
        }
      })
      .subscribe((status) => {
        logger.debug('Contacts real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          logger.debug('Contacts real-time active');
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('Contacts real-time channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      logger.debug('Cleaning up contacts real-time sync');
      
      // Use timeout to avoid immediate cleanup during strict mode
      cleanupTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          try {
            supabase.removeChannel(channelRef.current);
          } catch (err) {
            logger.warn('Warning during cleanup:', err);
          }
          channelRef.current = null;
        }
      }, 100);
    };
  }, [enabled, onContactAdded, onContactUpdated, onContactDeleted]);
};

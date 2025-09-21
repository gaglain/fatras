
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const channelRef = useRef<any>(null);
  
  useEffect(() => {
    if (!enabled) return;

    // Nettoyer l'ancien canal s'il existe
    if (channelRef.current) {
      console.log('🔌 Cleaning up previous contacts channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('🔄 Setting up contacts real-time sync');

    const channel = supabase
      .channel('contacts-rt-' + Date.now())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        console.log('✅ Contact added via real-time:', payload.new);
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
        console.log('📝 Contact updated via real-time:', payload.new);
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
        console.log('🗑️ Contact deleted via real-time:', payload.old?.id);
        if (onContactDeleted && payload.old?.id) {
          onContactDeleted(payload.old.id);
        }
      })
      .subscribe((status) => {
        console.log('📡 Contacts real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Contacts real-time active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Contacts real-time channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Cleaning up contacts real-time sync');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, onContactAdded, onContactUpdated, onContactDeleted]);
};

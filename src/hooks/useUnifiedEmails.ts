import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UnifiedEmail {
  id: string;
  message_id?: string;
  direction: 'sent' | 'received';
  from_email: string;
  from_name?: string;
  to_email: string;
  to_name?: string;
  subject?: string;
  content?: string;
  html_content?: string;
  status: string;
  provider: string;
  thread_id?: string;
  labels?: string[];
  attachments?: any;
  contact_id?: string;
  sent_at?: string;
  received_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export const useUnifiedEmails = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<UnifiedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadEmails();
    const cleanup = setupRealtimeSubscription();
    return () => {
      // Assure qu'on se désabonne proprement quand l'utilisateur change ou au démontage
      cleanup?.();
    };
  }, [user]);

  const loadEmails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          contacts (
            id,
            first_name,
            last_name,
            email,
            company
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setEmails(data as UnifiedEmail[] || []);
    } catch (error) {
      console.error('Erreur lors du chargement des emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel(`emails_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouvel email reçu:', payload);
          setEmails(prev => [payload.new as UnifiedEmail, ...prev]);
          
          // Show notification for received emails
          if (payload.new.direction === 'received') {
            toast.success(`Nouveau email de ${payload.new.from_name || payload.new.from_email}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setEmails(prev => prev.map(email => 
            email.id === payload.new.id ? payload.new as UnifiedEmail : email
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ read_at: new Date().toISOString() })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, read_at: new Date().toISOString() } : email
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const getEmailsByDirection = (direction: 'sent' | 'received') => {
    return emails.filter(email => email.direction === direction);
  };

  const getEmailsByContact = (contactId: string) => {
    return emails.filter(email => email.contact_id === contactId);
  };

  const getUnreadCount = () => {
    return emails.filter(email => email.direction === 'received' && !email.read_at).length;
  };

  return {
    emails,
    isLoading,
    loadEmails,
    markAsRead,
    getEmailsByDirection,
    getEmailsByContact,
    getUnreadCount
  };
};
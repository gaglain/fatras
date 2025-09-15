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

    // Auto-sync Nylas accounts once on mount, then every 3 minutes
    syncAllAccounts();
    const interval = setInterval(syncAllAccounts, 180000);

    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, [user]);

  const loadEmails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [unifiedRes, inboundRes] = await Promise.all([
        supabase
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
          .limit(100),
        supabase
          .from('inbound_emails')
          .select('*')
          .eq('user_id', user.id)
          .order('received_at', { ascending: false })
          .limit(100),
      ]);

      if (unifiedRes.error) throw unifiedRes.error;
      if (inboundRes.error) throw inboundRes.error;

      const unified = (unifiedRes.data as UnifiedEmail[]) ?? [];
      const inboundMapped: UnifiedEmail[] = ((inboundRes.data as any[]) ?? []).map((ie) => {
        // Déterminer la direction basée sur l'email de l'expéditeur
        const userEmails = ['booking@fatras.net', 'fatrasplanning@gmail.com']; // Ajouter les emails de l'utilisateur
        const isFromUser = userEmails.some(email => 
          ie.from_email?.toLowerCase().includes(email.toLowerCase())
        );
        
        return {
          id: ie.id,
          message_id: ie.message_id,
          direction: isFromUser ? 'sent' : 'received',
          from_email: ie.from_email,
          from_name: ie.from_name || ie.sender_name,
          to_email: ie.to_email,
          to_name: ie.to_name,
          subject: ie.subject,
          content: ie.content,
          html_content: ie.html_content,
          status: 'delivered',
          provider: ie.provider || 'imap',
          thread_id: ie.thread_id,
          labels: ie.labels,
          attachments: ie.attachments,
          contact_id: ie.contact_id,
          sent_at: ie.sent_at,
          received_at: ie.received_at,
          read_at: ie.read_at,
          created_at: ie.created_at ?? ie.received_at ?? new Date().toISOString(),
          updated_at: ie.updated_at ?? ie.received_at ?? new Date().toISOString(),
        };
      });

      const combined: UnifiedEmail[] = [...unified, ...inboundMapped].sort((a, b) => {
        const da = new Date(a.received_at || a.sent_at || a.created_at).getTime();
        const db = new Date(b.received_at || b.sent_at || b.created_at).getTime();
        return db - da;
      });

      setEmails(combined);
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inbound_emails',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const ie = payload.new as any;
          const mapped: UnifiedEmail = {
            id: ie.id,
            message_id: ie.message_id,
            direction: (ie.direction as 'received' | 'sent') || 'received',
            from_email: ie.from_email,
            from_name: ie.from_name || ie.sender_name,
            to_email: ie.to_email,
            to_name: ie.to_name,
            subject: ie.subject,
            content: ie.content,
            html_content: ie.html_content,
            status: 'delivered',
            provider: ie.provider || 'imap',
            thread_id: ie.thread_id,
            labels: ie.labels,
            attachments: ie.attachments,
            contact_id: ie.contact_id,
            sent_at: ie.sent_at,
            received_at: ie.received_at,
            read_at: ie.read_at,
            created_at: ie.created_at ?? ie.received_at ?? new Date().toISOString(),
            updated_at: ie.updated_at ?? ie.received_at ?? new Date().toISOString(),
          };
          setEmails(prev => [mapped, ...prev]);
          toast.success(`Nouveau email de ${mapped.from_name || mapped.from_email}`);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inbound_emails',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const ie = payload.new as any;
          setEmails(prev => prev.map(e => e.id === ie.id ? {
            ...e,
            message_id: ie.message_id,
            direction: (ie.direction as 'received' | 'sent') || 'received',
            from_email: ie.from_email,
            from_name: ie.from_name || ie.sender_name,
            to_email: ie.to_email,
            to_name: ie.to_name,
            subject: ie.subject,
            content: ie.content,
            html_content: ie.html_content,
            provider: ie.provider || e.provider,
            thread_id: ie.thread_id,
            labels: ie.labels,
            attachments: ie.attachments,
            contact_id: ie.contact_id,
            sent_at: ie.sent_at ?? e.sent_at,
            received_at: ie.received_at ?? e.received_at,
            read_at: ie.read_at ?? e.read_at,
            updated_at: ie.updated_at ?? e.updated_at,
            status: e.status || 'delivered',
          } : e));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const syncAllAccounts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: { action: 'list_accounts' }
      });
      if (error) throw error;
      const accounts = (data?.accounts ?? []) as Array<{ id: string; is_active: boolean }>;
      for (const acc of accounts) {
        if (!acc?.id) continue;
        try {
          await supabase.functions.invoke('nylas-email', {
            body: { action: 'sync', accountId: acc.id }
          });
        } catch (e) {
          console.error('Sync error for account', acc.id, e);
        }
      }
      await loadEmails();
    } catch (e) {
      console.error('Erreur synchro auto Nylas:', e);
    }
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
    getUnreadCount,
    syncNow: syncAllAccounts,
  };
};

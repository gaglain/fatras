import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
  attachments?: unknown;
  contact_id?: string;
  sent_at?: string;
  received_at?: string;
  read_at?: string;
  delivered_at?: string;
  opened_at?: string;
  is_read?: boolean;
  created_at: string;
  updated_at: string;
}

interface LoadEmailsOptions {
  contactId?: string;
  contactEmail?: string;
  limit?: number;
}

interface UseUnifiedEmailsOptions {
  autoLoad?: boolean;
}

export const useUnifiedEmails = (options: UseUnifiedEmailsOptions = {}) => {
  const { user } = useAuthContext();
  const { autoLoad = true } = options;
  const [emails, setEmails] = useState<UnifiedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (autoLoad) {
      void loadEmails();
    }

    const cleanup = setupRealtimeSubscription();

    // Auto-sync toutes les 5 minutes (pas besoin de plus fréquent car le realtime gère les nouveaux emails)
    // On ne lance PAS de sync au montage pour éviter les appels excessifs
    const interval = setInterval(() => {
      void syncAllAccounts();
    }, 5 * 60 * 1000);

    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, [user, autoLoad]);

  const loadEmails = async (options: LoadEmailsOptions = {}) => {
    if (!user) return;

    const normalizeAddress = (value: string) => {
      if (!value) return '';
      const match = value.match(/<([^>]+)>/);
      const email = match ? match[1] : value;
      return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
    };

    const normalizedContactEmail = normalizeAddress(options.contactEmail || '');
    const isContactScope = Boolean(options.contactId || normalizedContactEmail);
    const queryLimit = options.limit ?? (isContactScope ? 500 : 100);

    try {
      setIsLoading(true);

      let unifiedQuery = supabase
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
        .order('created_at', { ascending: false })
        .limit(queryLimit);

      const unifiedFilters: string[] = [];
      if (options.contactId) {
        unifiedFilters.push(`contact_id.eq.${options.contactId}`);
      }
      if (normalizedContactEmail) {
        unifiedFilters.push(`from_email.ilike.%${normalizedContactEmail}%`);
        unifiedFilters.push(`to_email.ilike.%${normalizedContactEmail}%`);
      }
      if (unifiedFilters.length > 0) {
        unifiedQuery = unifiedQuery.or(unifiedFilters.join(','));
      }

      const inboundQuery = !isContactScope || normalizedContactEmail
        ? supabase
            .from('inbound_emails')
            .select('*')
            .order('received_at', { ascending: false })
            .limit(queryLimit)
        : null;

      const [unifiedRes, inboundRes, accountsRes] = await Promise.all([
        unifiedQuery,
        inboundQuery
          ? normalizedContactEmail
            ? inboundQuery.or(`from_email.ilike.%${normalizedContactEmail}%,to_email.ilike.%${normalizedContactEmail}%`)
            : inboundQuery
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from('email_accounts')
          .select('email')
          .eq('is_active', true)
      ]);

      if (unifiedRes.error) throw unifiedRes.error;
      if (inboundRes.error) throw inboundRes.error;
      if (accountsRes.error) throw accountsRes.error;

      // Utilitaires

      const myEmailsSet = new Set(
        [
          ...(accountsRes.data?.map((a: any) => a.email) || []),
          user.email || '',
          // Hard guarantee: these accounts are always considered as "mine"
          'booking@fatras.net',
          'fatrasplanning@gmail.com'
        ]
          .filter(Boolean)
          .map((e: string) => normalizeAddress(e))
      );

      // Domains derived from user's email accounts (to catch aliases)
      const myDomainsSet = new Set(
        Array.from(myEmailsSet)
          .map((e: string) => e.split('@')[1])
          .filter(Boolean)
      );

      // Fonction pour vérifier si un label indique un email envoyé
      const isSentLabel = (label: string): boolean => {
        if (!label) return false;
        const lowerLabel = label.toLowerCase();
        return (
          lowerLabel.includes('sent') ||
          lowerLabel.includes('envoyé') ||
          lowerLabel.includes('outbox') ||
          lowerLabel === 'inbox.sent' ||
          lowerLabel === 'sent items' ||
          lowerLabel === '[gmail]/sent mail' ||
          lowerLabel === '[gmail]/messages envoyés'
        );
      };

      const unifiedRaw = (unifiedRes.data as any[]) ?? [];
      
      // Reclassify direction for unified emails to ensure "from" accounts are always sent
      const unified: UnifiedEmail[] = unifiedRaw.map((ue) => {
        const from = normalizeAddress(ue.from_email || '');
        const to = normalizeAddress(ue.to_email || '');
        const hasSentLabel = (ue.labels || []).some((l: string) => isSentLabel(l));
        let direction: 'sent' | 'received' = ue.direction as 'sent' | 'received';

        // Hard rule: any email originating from my accounts must be marked as sent
        if (myEmailsSet.has(from)) {
          direction = 'sent';
        } else if (hasSentLabel && !myEmailsSet.has(to)) {
          // If it carries a sent label and is not explicitly to me, consider it sent
          direction = 'sent';
        }
        
        const hardSentEmails = new Set(['booking@fatras.net','fatrasplanning@gmail.com']);
        if (hardSentEmails.has(from)) direction = 'sent';

        return {
          id: ue.id,
          message_id: ue.message_id,
          direction,
          from_email: ue.from_email,
          from_name: ue.from_name,
          to_email: ue.to_email,
          to_name: ue.to_name,
          subject: ue.subject,
          content: ue.content,
          html_content: ue.html_content,
          status: ue.status,
          provider: ue.provider,
          thread_id: ue.thread_id,
          labels: ue.labels,
          attachments: ue.attachments,
          contact_id: ue.contact_id,
          sent_at: ue.sent_at,
          received_at: ue.received_at,
          read_at: ue.read_at,
          delivered_at: ue.delivered_at,
          opened_at: ue.opened_at,
          is_read: ue.is_read,
          created_at: ue.created_at,
          updated_at: ue.updated_at,
        } as UnifiedEmail;
      });

      const inboundMapped: UnifiedEmail[] = ((inboundRes.data as any[]) ?? []).map((ie) => {
        const from = normalizeAddress(ie.from_email || '');
        const to = normalizeAddress(ie.to_email || '');
        const hasSentLabel = (ie.labels || []).some((l: string) => isSentLabel(l));
        const isFromUser = myEmailsSet.has(from);
        const isToMe = myEmailsSet.has(to);
        const fromDomain = (from.split('@')[1] || '').toLowerCase();
        const isFromMyDomain = fromDomain && myDomainsSet.has(fromDomain);
          let direction: 'sent' | 'received' = (isFromUser || hasSentLabel || (!isToMe && isFromMyDomain)) ? 'sent' : 'received';
          const hardSentEmails = new Set(['booking@fatras.net','fatrasplanning@gmail.com']);
          if (hardSentEmails.has(from)) direction = 'sent';

        return {
          id: ie.id,
          message_id: ie.message_id,
          direction,
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
          delivered_at: ie.received_at,
          opened_at: undefined,
          is_read: Boolean(ie.read_at),
          created_at: ie.created_at ?? ie.received_at ?? new Date().toISOString(),
          updated_at: ie.updated_at ?? ie.received_at ?? new Date().toISOString(),
        };
      });

      // Déduplication par message_id
      const emailMap = new Map<string, UnifiedEmail>();
      [...unified, ...inboundMapped].forEach(email => {
        const key = email.message_id || email.id;
        if (!emailMap.has(key)) {
          emailMap.set(key, email);
        }
      });

      const combined: UnifiedEmail[] = Array.from(emailMap.values()).sort((a, b) => {
        const da = new Date(a.received_at || a.sent_at || a.created_at).getTime();
        const db = new Date(b.received_at || b.sent_at || b.created_at).getTime();
        return db - da;
      });

      setEmails(combined);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel(`emails_changes_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('Nouvel email reçu:', payload);
          const newEmail = payload.new as UnifiedEmail;
          setEmails(prev => [newEmail, ...prev]);
          
          if (newEmail.direction === 'received') {
            // Notification toast
            toast.success(`📧 Nouveau email de ${newEmail.from_name || newEmail.from_email}`, {
              description: newEmail.subject || 'Sans objet',
              duration: 5000,
            });
            
            // Créer une notification dans la base de données
            supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'new_email',
                title: 'Nouveau email reçu',
                message: `De: ${newEmail.from_name || newEmail.from_email} - ${newEmail.subject || 'Sans objet'}`,
                data: {
                  email_id: newEmail.id,
                  from_email: newEmail.from_email,
                  from_name: newEmail.from_name,
                  subject: newEmail.subject
                },
                read: false
              })
              .then(({ error }) => {
                if (error) logger.error('Erreur création notification email:', error);
              });
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
          // Classify direction heuristically using current user's email
          const normalize = (v: string) => {
            if (!v) return '';
            const m = v.match(/<([^>]+)>/);
            const email = m ? m[1] : v;
            return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
          };
          const myAddr = normalize(user.email || '');
          const from = normalize(ie.from_email || '');
          const to = normalize(ie.to_email || '');
          const myDomain = (myAddr.split('@')[1] || '').toLowerCase();
          
          const isSentLabelCheck = (label: string): boolean => {
            if (!label) return false;
            const lowerLabel = label.toLowerCase();
            return (
              lowerLabel.includes('sent') ||
              lowerLabel.includes('envoyé') ||
              lowerLabel.includes('outbox') ||
              lowerLabel === 'inbox.sent' ||
              lowerLabel === 'sent items' ||
              lowerLabel === '[gmail]/sent mail' ||
              lowerLabel === '[gmail]/messages envoyés'
            );
          };
          
          const hasSentLabel = (ie.labels || []).some((l: string) => isSentLabelCheck(l));
          const isFromMyDomain = myDomain && from.endsWith(`@${myDomain}`);
          const isToMe = to === myAddr;
          let direction: 'sent' | 'received' = (from === myAddr || hasSentLabel || (!isToMe && isFromMyDomain)) ? 'sent' : 'received';
          const hardSentEmails = new Set(['booking@fatras.net','fatrasplanning@gmail.com']);
          if (hardSentEmails.has(from)) direction = 'sent';

          const mapped: UnifiedEmail = {
            id: ie.id,
            message_id: ie.message_id,
            direction,
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
            delivered_at: ie.received_at,
            opened_at: undefined,
            is_read: Boolean(ie.read_at),
            created_at: ie.created_at ?? ie.received_at ?? new Date().toISOString(),
            updated_at: ie.updated_at ?? ie.received_at ?? new Date().toISOString(),
          };
          setEmails(prev => [mapped, ...prev]);
          
          // Notification toast
          toast.success(`📧 Nouveau email de ${mapped.from_name || mapped.from_email}`, {
            description: mapped.subject || 'Sans objet',
            duration: 5000,
          });
          
          // Créer une notification dans la base de données pour les emails reçus
          if (mapped.direction === 'received') {
            supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'new_email',
                title: 'Nouveau email reçu',
                message: `De: ${mapped.from_name || mapped.from_email} - ${mapped.subject || 'Sans objet'}`,
                data: {
                  email_id: mapped.id,
                  from_email: mapped.from_email,
                  from_name: mapped.from_name,
                  subject: mapped.subject
                },
                read: false
              })
              .then(({ error }) => {
                if (error) logger.error('Erreur création notification email:', error);
              });
          }
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
          setEmails(prev => prev.map(e => {
            if (e.id !== ie.id) return e;
            const normalize = (v: string) => {
              if (!v) return '';
              const m = v.match(/<([^>]+)>/);
              const email = m ? m[1] : v;
              return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
            };
            const myAddr = normalize(user.email || '');
            const from = normalize(ie.from_email || '');
            const to = normalize(ie.to_email || '');
            const myDomain = (myAddr.split('@')[1] || '').toLowerCase();
            
            const isSentLabelCheck = (label: string): boolean => {
              if (!label) return false;
              const lowerLabel = label.toLowerCase();
              return (
                lowerLabel.includes('sent') ||
                lowerLabel.includes('envoyé') ||
                lowerLabel.includes('outbox') ||
                lowerLabel === 'inbox.sent' ||
                lowerLabel === 'sent items' ||
                lowerLabel === '[gmail]/sent mail' ||
                lowerLabel === '[gmail]/messages envoyés'
              );
            };
            
            const hasSentLabel = (ie.labels || []).some((l: string) => isSentLabelCheck(l));
            const isFromMyDomain = myDomain && from.endsWith(`@${myDomain}`);
            const isToMe = to === myAddr;
             let direction: 'sent' | 'received' = (from === myAddr || hasSentLabel || (!isToMe && isFromMyDomain)) ? 'sent' : 'received';

             const hardSentEmails = new Set(['booking@fatras.net','fatrasplanning@gmail.com']);
             if (hardSentEmails.has(from)) direction = 'sent';

            return {
              ...e,
              message_id: ie.message_id,
              direction,
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
              delivered_at: ie.received_at ?? e.delivered_at,
              opened_at: e.opened_at,
              is_read: ie.read_at ? true : e.is_read,
              updated_at: ie.updated_at ?? e.updated_at,
              status: e.status || 'delivered',
            };
          }));
        }
      )
      .subscribe();

    return () => {
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (err: unknown) {
          logger.warn('⚠️ Warning during unified emails cleanup:', err);
        }
      }, 100);
    };
  };

  const syncAllAccounts = async (options: LoadEmailsOptions = {}) => {
    if (!user) return;
    try {
      logger.debug('🔄 Démarrage de la synchronisation automatique des emails...');
      
      // Essayer d'abord la fonction sync-imap-emails pour la synchronisation IMAP
      try {
        const { data: imapData, error: imapError } = await supabase.functions.invoke('sync-imap-emails', {
          body: {
            userId: user.id,
            action: 'sync'
          }
        });

        if (!imapError && imapData?.success) {
          logger.debug('✅ Synchronisation IMAP réussie:', imapData);
          await loadEmails(options);
          return;
        }
      } catch (imapSyncError: unknown) {
        logger.debug('📧 IMAP sync non disponible, essai avec Nylas...');
      }

      // Si IMAP échoue, essayer avec Nylas
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
        } catch (syncError: unknown) {
          logger.error('Sync error for account', acc.id, syncError);
        }
      }
      
      await loadEmails(options);
      logger.debug('✅ Synchronisation Nylas terminée');
    } catch (syncError: unknown) {
      logger.error('❌ Erreur synchro auto:', syncError);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const readTimestamp = new Date().toISOString();

      const { error } = await supabase
        .from('emails')
        .update({ read_at: readTimestamp, is_read: true })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, read_at: readTimestamp, is_read: true } : email
      ));
    } catch (error: unknown) {
      logger.error('Erreur lors du marquage comme lu:', error);
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

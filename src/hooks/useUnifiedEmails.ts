import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  normalizeAddress,
  isSentLabel,
  classifyDirection,
  buildMyEmailsSet,
  buildMyDomainsSet,
} from './useEmailDirectionClassifier';

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

const mapUnifiedRow = (ue: any, myEmailsSet: Set<string>): UnifiedEmail => {
  const direction = classifyDirection(ue.from_email || '', ue.to_email || '', ue.labels || [], myEmailsSet);
  return {
    id: ue.id, message_id: ue.message_id, direction,
    from_email: ue.from_email, from_name: ue.from_name, to_email: ue.to_email, to_name: ue.to_name,
    subject: ue.subject, content: ue.content, html_content: ue.html_content,
    status: ue.status, provider: ue.provider, thread_id: ue.thread_id, labels: ue.labels,
    attachments: ue.attachments, contact_id: ue.contact_id,
    sent_at: ue.sent_at, received_at: ue.received_at, read_at: ue.read_at,
    delivered_at: ue.delivered_at, opened_at: ue.opened_at, is_read: ue.is_read,
    created_at: ue.created_at, updated_at: ue.updated_at,
  };
};

const mapInboundRow = (ie: any, myEmailsSet: Set<string>, myDomainsSet: Set<string>): UnifiedEmail => {
  const direction = classifyDirection(ie.from_email || '', ie.to_email || '', ie.labels || [], myEmailsSet, myDomainsSet);
  return {
    id: ie.id, message_id: ie.message_id, direction,
    from_email: ie.from_email, from_name: ie.from_name || ie.sender_name,
    to_email: ie.to_email, to_name: ie.to_name,
    subject: ie.subject, content: ie.content, html_content: ie.html_content,
    status: 'delivered', provider: ie.provider || 'imap',
    thread_id: ie.thread_id, labels: ie.labels, attachments: ie.attachments,
    contact_id: ie.contact_id, sent_at: ie.sent_at,
    received_at: ie.received_at, read_at: ie.read_at,
    delivered_at: ie.received_at, opened_at: undefined,
    is_read: Boolean(ie.read_at),
    created_at: ie.created_at ?? ie.received_at ?? new Date().toISOString(),
    updated_at: ie.updated_at ?? ie.received_at ?? new Date().toISOString(),
  };
};

export const useUnifiedEmails = (options: UseUnifiedEmailsOptions = {}) => {
  const { user } = useAuthContext();
  const { autoLoad = true } = options;
  const [emails, setEmails] = useState<UnifiedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (autoLoad) void loadEmails();
    const cleanup = setupRealtimeSubscription();
    const interval = setInterval(() => { void syncAllAccounts(); }, 5 * 60 * 1000);
    return () => { cleanup?.(); clearInterval(interval); };
  }, [user, autoLoad]);

  const loadEmails = async (opts: LoadEmailsOptions = {}) => {
    if (!user) return;
    const normalizedContactEmail = normalizeAddress(opts.contactEmail || '');
    const isContactScope = Boolean(opts.contactId || normalizedContactEmail);
    const queryLimit = opts.limit ?? (isContactScope ? 500 : 100);

    try {
      setIsLoading(true);

      let unifiedQuery = supabase
        .from('emails')
        .select(`*, contacts (id, first_name, last_name, email, company)`)
        .order('created_at', { ascending: false })
        .limit(queryLimit);

      const unifiedFilters: string[] = [];
      if (opts.contactId) unifiedFilters.push(`contact_id.eq.${opts.contactId}`);
      if (normalizedContactEmail) {
        unifiedFilters.push(`from_email.ilike.%${normalizedContactEmail}%`);
        unifiedFilters.push(`to_email.ilike.%${normalizedContactEmail}%`);
      }
      if (unifiedFilters.length > 0) unifiedQuery = unifiedQuery.or(unifiedFilters.join(','));

      const inboundQuery = !isContactScope || normalizedContactEmail
        ? supabase.from('inbound_emails').select('*').order('received_at', { ascending: false }).limit(queryLimit)
        : null;

      const [unifiedRes, inboundRes, accountsRes] = await Promise.all([
        unifiedQuery,
        inboundQuery
          ? normalizedContactEmail
            ? inboundQuery.or(`from_email.ilike.%${normalizedContactEmail}%,to_email.ilike.%${normalizedContactEmail}%`)
            : inboundQuery
          : Promise.resolve({ data: [], error: null } as any),
        supabase.from('email_accounts').select('email').eq('is_active', true)
      ]);

      if (unifiedRes.error) throw unifiedRes.error;
      if (inboundRes.error) throw inboundRes.error;
      if (accountsRes.error) throw accountsRes.error;

      const myEmailsSet = buildMyEmailsSet(
        accountsRes.data?.map((a: any) => a.email) || [],
        user.email || ''
      );
      const myDomainsSet = buildMyDomainsSet(myEmailsSet);

      const unified = ((unifiedRes.data as any[]) ?? []).map(ue => mapUnifiedRow(ue, myEmailsSet));
      const inboundMapped = ((inboundRes.data as any[]) ?? []).map(ie => mapInboundRow(ie, myEmailsSet, myDomainsSet));

      const emailMap = new Map<string, UnifiedEmail>();
      [...unified, ...inboundMapped].forEach(email => {
        const key = email.message_id || email.id;
        if (!emailMap.has(key)) emailMap.set(key, email);
      });

      const combined = Array.from(emailMap.values()).sort((a, b) => {
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

  const createEmailNotification = (email: UnifiedEmail) => {
    if (email.direction !== 'received' || !user) return;
    supabase.from('notifications').insert({
      user_id: user.id, type: 'new_email', title: 'Nouveau email reçu',
      message: `De: ${email.from_name || email.from_email} - ${email.subject || 'Sans objet'}`,
      data: { email_id: email.id, from_email: email.from_email, from_name: email.from_name, subject: email.subject },
      read: false
    }).then(({ error }) => { if (error) logger.error('Erreur création notification email:', error); });
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;
    const myAddr = normalizeAddress(user.email || '');
    const myEmailsSet = buildMyEmailsSet([], user.email || '');
    const myDomainsSet = buildMyDomainsSet(myEmailsSet);

    const channel = supabase
      .channel(`emails_changes_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emails', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const mapped = mapUnifiedRow(payload.new, myEmailsSet);
          setEmails(prev => [mapped, ...prev]);
          if (mapped.direction === 'received') {
            toast.success(`📧 Nouveau email de ${mapped.from_name || mapped.from_email}`, { description: mapped.subject || 'Sans objet', duration: 5000 });
            createEmailNotification(mapped);
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'emails', filter: `user_id=eq.${user.id}` },
        (payload) => { setEmails(prev => prev.map(email => email.id === payload.new.id ? payload.new as UnifiedEmail : email)); }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inbound_emails', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const mapped = mapInboundRow(payload.new, myEmailsSet, myDomainsSet);
          setEmails(prev => [mapped, ...prev]);
          toast.success(`📧 Nouveau email de ${mapped.from_name || mapped.from_email}`, { description: mapped.subject || 'Sans objet', duration: 5000 });
          createEmailNotification(mapped);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inbound_emails', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const ie = payload.new as any;
          setEmails(prev => prev.map(e => {
            if (e.id !== ie.id) return e;
            const updated = mapInboundRow(ie, myEmailsSet, myDomainsSet);
            return { ...e, ...updated, status: e.status || 'delivered' };
          }));
        }
      )
      .subscribe();

    return () => {
      setTimeout(() => { try { supabase.removeChannel(channel); } catch (err) { logger.warn('⚠️ Warning during unified emails cleanup:', err); } }, 100);
    };
  };

  const syncAllAccounts = async (opts: LoadEmailsOptions = {}) => {
    if (!user) return;
    try {
      logger.debug('🔄 Démarrage de la synchronisation automatique des emails...');
      try {
        const { data: imapData, error: imapError } = await supabase.functions.invoke('sync-imap-emails', { body: { userId: user.id, action: 'sync' } });
        if (!imapError && imapData?.success) { logger.debug('✅ Synchronisation IMAP réussie:', imapData); await loadEmails(opts); return; }
      } catch { logger.debug('📧 IMAP sync non disponible, essai avec Nylas...'); }

      const { data, error } = await supabase.functions.invoke('nylas-email', { body: { action: 'list_accounts' } });
      if (error) throw error;
      const accounts = (data?.accounts ?? []) as Array<{ id: string; is_active: boolean }>;
      for (const acc of accounts) {
        if (!acc?.id) continue;
        try { await supabase.functions.invoke('nylas-email', { body: { action: 'sync', accountId: acc.id } }); }
        catch (syncError) { logger.error('Sync error for account', acc.id, syncError); }
      }
      await loadEmails(opts);
      logger.debug('✅ Synchronisation Nylas terminée');
    } catch (syncError) { logger.error('❌ Erreur synchro auto:', syncError); }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const readTimestamp = new Date().toISOString();
      const { error } = await supabase.from('emails').update({ read_at: readTimestamp, is_read: true }).eq('id', emailId);
      if (error) throw error;
      setEmails(prev => prev.map(email => email.id === emailId ? { ...email, read_at: readTimestamp, is_read: true } : email));
    } catch (error) { logger.error('Erreur lors du marquage comme lu:', error); }
  };

  return {
    emails, isLoading, loadEmails, markAsRead,
    getEmailsByDirection: (direction: 'sent' | 'received') => emails.filter(e => e.direction === direction),
    getEmailsByContact: (contactId: string) => emails.filter(e => e.contact_id === contactId),
    getUnreadCount: () => emails.filter(e => e.direction === 'received' && !e.read_at).length,
    syncNow: syncAllAccounts,
  };
};

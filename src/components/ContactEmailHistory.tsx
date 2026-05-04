import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Inbox, Clock, User, RefreshCw, Reply, Megaphone, MessagesSquare, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedEmails } from '@/hooks/useUnifiedEmails';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EmailComposer } from '@/components/email/EmailComposer';
import { sanitizeEmailHtml } from '@/lib/sanitize';
import { supabase } from '@/integrations/supabase/client';
import { decodeMimeHeader, normalizeSubject } from '@/lib/mimeDecoder';

interface ContactEmailHistoryProps {
  contactId: string;
  contactEmail?: string;
}

export const ContactEmailHistory: React.FC<ContactEmailHistoryProps> = ({ 
  contactId, 
  contactEmail 
}) => {
  const { emails, isLoading, loadEmails, markAsRead, syncNow } = useUnifiedEmails({ autoLoad: false });
  const [selectedEmail, setSelectedEmail] = React.useState<any | null>(null);
  const [showReply, setShowReply] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [campaignEmails, setCampaignEmails] = React.useState<any[]>([]);

  const normalizeAddress = React.useCallback((value?: string) => {
    if (!value) return '';
    const match = value.match(/<([^>]+)>/);
    const email = match ? match[1] : value;
    return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
  }, []);

  const normalizedContactEmail = React.useMemo(
    () => normalizeAddress(contactEmail),
    [contactEmail, normalizeAddress]
  );

  // Load campaign emails sent to this contact (from email_analytics + email_campaigns)
  const loadCampaignEmails = React.useCallback(async () => {
    if (!contactId) { setCampaignEmails([]); return; }
    try {
      const { data: analytics } = await supabase
        .from('email_analytics')
        .select('id, campaign_id, contact_id, event_type, event_data, created_at')
        .eq('contact_id', contactId)
        .in('event_type', ['sent', 'delivered', 'opened', 'clicked', 'bounced'])
        .order('created_at', { ascending: false })
        .limit(500);

      if (!analytics || analytics.length === 0) { setCampaignEmails([]); return; }

      // Collapse multiple events per campaign into one entry, with the most engaged status
      const campaignIds = Array.from(new Set(analytics.map((a: any) => a.campaign_id).filter(Boolean)));
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('id, name, subject, content, sent_at, created_at')
        .in('id', campaignIds.length ? campaignIds : ['00000000-0000-0000-0000-000000000000']);

      const campaignMap = new Map<string, any>();
      (campaigns || []).forEach((c: any) => campaignMap.set(c.id, c));

      // Enrich individual analytics entries with HTML/content from `emails` table.
      // Try lookup by event_data.email_id first, then fallback to subject+recipient.
      const emailIdsFromEvents = Array.from(new Set(
        analytics
          .map((a: any) => a?.event_data?.email_id)
          .filter((id: any) => typeof id === 'string' && id.length > 0)
      ));
      const subjectsFromEvents = Array.from(new Set(
        analytics
          .map((a: any) => a?.event_data?.subject)
          .filter((s: any) => typeof s === 'string' && s.length > 0)
      ));

      const emailContentById = new Map<string, any>();
      const emailContentBySubject = new Map<string, any>();

      if (emailIdsFromEvents.length > 0) {
        const { data: byId } = await supabase
          .from('emails')
          .select('id, subject, content, html_content, to_email')
          .in('id', emailIdsFromEvents);
        (byId || []).forEach((e: any) => emailContentById.set(e.id, e));
      }

      if (subjectsFromEvents.length > 0 && contactEmail) {
        const { data: bySubj } = await supabase
          .from('emails')
          .select('id, subject, content, html_content, to_email, created_at')
          .in('subject', subjectsFromEvents)
          .ilike('to_email', `%${contactEmail}%`)
          .order('created_at', { ascending: false });
        (bySubj || []).forEach((e: any) => {
          if (!emailContentBySubject.has(e.subject)) emailContentBySubject.set(e.subject, e);
        });
      }

      const STATUS_RANK: Record<string, number> = { sent: 1, delivered: 2, opened: 3, clicked: 4, bounced: 5 };
      const grouped = new Map<string, any>();

      for (const ev of analytics as any[]) {
        const camp = ev.campaign_id ? campaignMap.get(ev.campaign_id) : null;
        const evData = (ev.event_data || {}) as any;
        const isIndividual = !ev.campaign_id || evData.source === 'individual';
        // Subject precedence: campaign subject > campaign name > event_data.subject > fallback
        const subjectFromEvent = typeof evData.subject === 'string' ? evData.subject : '';
        const resolvedSubject =
          camp?.subject ||
          camp?.name ||
          subjectFromEvent ||
          (isIndividual ? '(Email individuel sans sujet)' : '(Campagne sans sujet)');

        // Group individual emails by event_data.subject (so multiple events for the
        // same individual email collapse together); group campaign emails by campaign_id.
        const groupingId = ev.campaign_id || `individual-${subjectFromEvent || ev.id}`;
        const key = `${groupingId}-${ev.contact_id}`;
        const existing = grouped.get(key);
        // Try to enrich with real HTML/content from the `emails` table
        const linkedEmail =
          (evData.email_id && emailContentById.get(evData.email_id)) ||
          (subjectFromEvent && emailContentBySubject.get(subjectFromEvent)) ||
          null;

        const candidate = {
          id: `analytics-${key}`,
          message_id: `analytics-${key}`,
          direction: 'sent' as const,
          source: isIndividual ? 'individual' : 'campaign',
          campaign_name: camp?.name,
          from_email: 'booking@fatras.net',
          from_name: isIndividual ? 'Email envoyé' : 'Campagne',
          to_email: contactEmail || linkedEmail?.to_email || '',
          to_name: '',
          subject: resolvedSubject,
          content: linkedEmail?.content || camp?.content || evData.content || '',
          html_content: linkedEmail?.html_content || camp?.content || evData.html || '',
          status: ev.event_type,
          provider: isIndividual ? 'resend' : 'campaign',
          sent_at: camp?.sent_at || ev.created_at,
          created_at: ev.created_at,
          updated_at: ev.created_at,
          opened_at: ev.event_type === 'opened' ? ev.created_at : null,
          delivered_at: ev.event_type === 'delivered' ? ev.created_at : null,
        };
        if (!existing || (STATUS_RANK[ev.event_type] ?? 0) > (STATUS_RANK[existing.status] ?? 0)) {
          grouped.set(key, { ...(existing || {}), ...candidate });
        } else {
          if (ev.event_type === 'opened' && !existing.opened_at) existing.opened_at = ev.created_at;
          if (ev.event_type === 'delivered' && !existing.delivered_at) existing.delivered_at = ev.created_at;
        }
      }
      setCampaignEmails(Array.from(grouped.values()));
    } catch (err) {
      console.error('Erreur chargement emails campagnes:', err);
      setCampaignEmails([]);
    }
  }, [contactId, contactEmail]);

  // Recharger les emails quand le composant est monté et quand contactId/contactEmail change
  React.useEffect(() => {
    if (contactId || normalizedContactEmail) {
      loadEmails({
        contactId,
        contactEmail: normalizedContactEmail,
        limit: 500,
      });
    }
    loadCampaignEmails();
  }, [contactId, normalizedContactEmail, loadCampaignEmails]);

  const stripTags = (s: string) => s ? s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  const getPreviewText = (email: any) => {
    const base = email?.html_content || email?.content || '';
    return stripTags(base).slice(0, 120);
  };
  // Using sanitizeEmailHtml from @/lib/sanitize instead of inline function

  // Filter emails for this specific contact - memoized to avoid recalculating on every render
  const contactEmails = React.useMemo(() => {
    const direct = emails.filter(email => {
      if (email.contact_id === contactId) return true;
      if (!normalizedContactEmail) return false;

      const fromEmail = normalizeAddress(email.from_email);
      const toEmail = normalizeAddress(email.to_email);
      return fromEmail === normalizedContactEmail || toEmail === normalizedContactEmail;
    });

    // Merge campaign emails (from email_analytics) — dedupe on message_id
    const seen = new Set(direct.map(e => e.message_id || e.id));
    const merged = [...direct];
    for (const ce of campaignEmails) {
      const key = ce.message_id || ce.id;
      if (!seen.has(key)) { merged.push(ce); seen.add(key); }
    }

    return merged.sort((a, b) => {
      const da = new Date(a.received_at || a.sent_at || a.created_at).getTime();
      const db = new Date(b.received_at || b.sent_at || b.created_at).getTime();
      return db - da;
    });
  }, [emails, campaignEmails, contactId, normalizedContactEmail, normalizeAddress]);

  const receivedEmails = React.useMemo(() => 
    contactEmails.filter(email => email.direction === 'received'), 
    [contactEmails]);
  
  const sentEmails = React.useMemo(() => 
    contactEmails.filter(email => email.direction === 'sent'), 
    [contactEmails]);

  // Group by normalized subject for Gmail-style conversation view
  const threads = React.useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of contactEmails) {
      const key = normalizeSubject(e.subject) || `__no_subject_${e.id}`;
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    }
    const result = Array.from(map.entries()).map(([key, items]) => {
      const sorted = [...items].sort((a, b) => {
        const da = new Date(a.received_at || a.sent_at || a.created_at).getTime();
        const db = new Date(b.received_at || b.sent_at || b.created_at).getTime();
        return db - da;
      });
      return {
        key,
        subject: decodeMimeHeader(sorted[0].subject) || '(Aucun sujet)',
        latestAt: sorted[0].received_at || sorted[0].sent_at || sorted[0].created_at,
        items: sorted,
        unreadCount: sorted.filter((e) => e.direction === 'received' && !e.read_at).length,
      };
    });
    return result.sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
  }, [contactEmails]);

  const [expandedThreads, setExpandedThreads] = React.useState<Set<string>>(new Set());
  const toggleThread = (key: string) =>
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      // Rattache les emails existants aux contacts (par adresse email) côté DB
      try { await supabase.rpc('update_email_contact_links'); } catch (e) { console.warn('relink failed', e); }
      await syncNow({ contactId, contactEmail: normalizedContactEmail, limit: 500 });
      await loadEmails({ contactId, contactEmail: normalizedContactEmail, limit: 500 });
      await loadCampaignEmails();
    } finally {
      setIsSyncing(false);
    }
  }, [syncNow, loadEmails, loadCampaignEmails, contactId, normalizedContactEmail]);

  const getTrackingLabel = (status?: string) => {
    switch (status) {
      case 'clicked':
        return 'Cliqué';
      case 'opened':
        return 'Ouvert';
      case 'delivered':
        return 'Livré';
      case 'sent':
        return 'Envoyé';
      case 'pending':
        return 'En attente';
      case 'bounced':
        return 'Rebond';
      default:
        return status || 'Statut inconnu';
    }
  };

  const getTrackingVariant = (status?: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'clicked':
      case 'opened':
        return 'default';
      case 'delivered':
      case 'sent':
        return 'secondary';
      case 'bounced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleEmailClick = (email: any) => {
    if (email.direction === 'received' && !email.read_at) {
      markAsRead(email.id);
    }
    setSelectedEmail(email);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Historique des emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Chargement des emails...
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderEmailItem = (email: any) => (
    <div
      key={email.id}
      className={`p-3 rounded-lg border transition-colors ${
        email.direction === 'received' && !email.read_at 
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200' 
          : 'border-border'
      }`}
    >
      <div 
        className="cursor-pointer hover:bg-muted/50 -m-3 p-3 rounded-lg"
        onClick={() => handleEmailClick(email)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {email.direction === 'received' ? (
                <Inbox className="h-3 w-3 text-green-600 shrink-0" />
              ) : (
                <Send className="h-3 w-3 text-blue-600 shrink-0" />
              )}
              <Badge 
                variant={email.direction === 'received' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {email.direction === 'received' ? 'Reçu' : 'Envoyé'}
              </Badge>
              {email.direction === 'sent' && (
                <Badge variant={getTrackingVariant(email.status)} className="text-xs">
                  {getTrackingLabel(email.status)}
                </Badge>
              )}
              {email.source === 'campaign' && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Megaphone className="h-3 w-3" />
                  {email.campaign_name || 'Campagne'}
                </Badge>
              )}
              {email.direction === 'received' && !email.read_at && (
                <Badge variant="outline" className="text-xs">
                  Nouveau
                </Badge>
              )}
            </div>
            
            <h4 className={`text-sm font-medium line-clamp-2 mb-1 ${
              email.direction === 'received' && !email.read_at ? 'font-semibold' : ''
            }`}>
              {decodeMimeHeader(email.subject) || '(Aucun sujet)'}
            </h4>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {getPreviewText(email)}...
            </p>
            
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {formatDate(email.received_at || email.sent_at || email.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {email.direction === 'received' 
                    ? (email.from_name || email.from_email)
                    : (email.to_name || email.to_email)
                  }
                </span>
            </div>

            {email.direction === 'sent' && (
              <p className="text-xs text-muted-foreground mt-1">
                Statut: {getTrackingLabel(email.status)}
                {email.opened_at
                  ? ` • Ouvert le ${formatDate(email.opened_at)}`
                  : email.delivered_at
                    ? ` • Livré le ${formatDate(email.delivered_at)}`
                    : ''}
              </p>
            )}
          </div>
          </div>
        </div>
      </div>
      
      {email.direction === 'received' && (
        <div className="mt-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmail(email);
              setShowReply(true);
            }}
          >
            <Reply className="h-3 w-3 mr-2" />
            Répondre
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <CardTitle>Historique des emails</CardTitle>
              {contactEmails.length > 0 && (
                <Badge variant="secondary">{contactEmails.length}</Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Synchro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contactEmails.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucun email trouvé</p>
              <p className="text-sm">Les échanges d'emails avec ce contact apparaîtront ici</p>
            </div>
          ) : (
            <Tabs defaultValue="threads" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="threads" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                  <MessagesSquare className="h-3 w-3 shrink-0" />
                  <span className="text-xs sm:text-sm">Conversations ({threads.length})</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="text-xs sm:text-sm">Tous ({contactEmails.length})</span>
                </TabsTrigger>
                <TabsTrigger value="received" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                  <Inbox className="h-3 w-3 shrink-0" />
                  <span className="text-xs sm:text-sm">Reçus ({receivedEmails.length})</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                  <Send className="h-3 w-3 shrink-0" />
                  <span className="text-xs sm:text-sm">Envoyés ({sentEmails.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="threads" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2 pr-4">
                    {threads.map((t) => {
                      const isOpen = expandedThreads.has(t.key);
                      return (
                        <div key={t.key} className="border rounded-lg">
                          <button
                            type="button"
                            onClick={() => toggleThread(t.key)}
                            className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 rounded-lg"
                          >
                            {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                            <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm truncate ${t.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                                  {t.subject}
                                </h4>
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {t.items.length}
                                </Badge>
                                {t.unreadCount > 0 && (
                                  <Badge variant="default" className="text-xs shrink-0">
                                    {t.unreadCount} nouveau{t.unreadCount > 1 ? 'x' : ''}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Dernier message: {formatDate(t.latestAt)}
                              </p>
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 space-y-2 border-t pt-3">
                              {t.items.map(renderEmailItem)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-3 pr-4">
                    {contactEmails.map(renderEmailItem)}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="received" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-3 pr-4">
                    {receivedEmails.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun email reçu</p>
                      </div>
                    ) : (
                      receivedEmails.map(renderEmailItem)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="sent" className="mt-4">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-3">
                    {sentEmails.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun email envoyé</p>
                      </div>
                    ) : (
                      sentEmails.map(renderEmailItem)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour afficher l'email complet */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEmail?.direction === 'received' ? (
                <Inbox className="h-4 w-4 text-green-600" />
              ) : (
                <Send className="h-4 w-4 text-blue-600" />
              )}
              {decodeMimeHeader(selectedEmail?.subject) || '(Aucun sujet)'}
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="flex flex-col gap-1 text-sm">
                <div><strong>De:</strong> {selectedEmail?.from_name || selectedEmail?.from_email}</div>
                <div><strong>À:</strong> {selectedEmail?.to_name || selectedEmail?.to_email}</div>
                <div><strong>Date:</strong> {selectedEmail && formatDate(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at)}</div>
                <div><strong>Provider:</strong> {selectedEmail?.provider}</div>
                {selectedEmail?.direction === 'sent' && (
                  <div>
                    <strong>Suivi:</strong> {getTrackingLabel(selectedEmail?.status)}
                    {selectedEmail?.opened_at
                      ? ` • Ouvert le ${formatDate(selectedEmail.opened_at)}`
                      : selectedEmail?.delivered_at
                        ? ` • Livré le ${formatDate(selectedEmail.delivered_at)}`
                        : ''}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            {selectedEmail?.html_content ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeEmailHtml(selectedEmail.html_content) 
                }} 
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm">
                {selectedEmail?.content || 'Aucun contenu disponible'}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog de réponse */}
      <EmailComposer 
        isOpen={showReply}
        onClose={() => {
          setShowReply(false);
          setSelectedEmail(null);
        }}
        toEmail={selectedEmail?.from_email || ''}
        subject={`Re: ${decodeMimeHeader(selectedEmail?.subject) || ''}`}
        preText={`\n\n---\nDe: ${selectedEmail?.from_name || selectedEmail?.from_email}\nDate: ${selectedEmail && formatDate(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at)}\n\n${stripTags(selectedEmail?.html_content || selectedEmail?.content || '')}`}
      />
    </>
  );
};
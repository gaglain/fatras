import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Plus, Inbox, Archive, Settings } from 'lucide-react';
import { useEmailSystem } from '@/hooks/useEmailSystem';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmailComposer } from '@/components/email/EmailComposer';
import { EmailComposeTab } from '@/components/email/EmailComposeTab';
import { EmailInbox } from '@/components/email/EmailInbox';

interface EmailDraft {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  fromName: string;
  isHtml: boolean;
}

interface InboundEmail {
  id: string;
  message_id?: string;
  from_email: string;
  to_email: string;
  subject: string;
  content: string;
  html_content?: string;
  received_at: string;
  read_at?: string;
  provider: string;
  labels?: string[];
}

export const UnifiedEmailInterface: React.FC = () => {
  const { user } = useAuth();
  const { sendEmail, getActiveProviders, sending } = useEmailSystem();

  const [activeTab, setActiveTab] = useState('compose');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [inboundEmails, setInboundEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountEmails, setAccountEmails] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState<'reply' | 'forward' | null>(null);
  const [composerSourceEmail, setComposerSourceEmail] = useState<InboundEmail | null>(null);

  const [draft, setDraft] = useState<EmailDraft>({
    to: '', cc: '', bcc: '', subject: '', body: '',
    fromName: user?.email?.split('@')[0] || 'Expéditeur',
    isHtml: false
  });

  useEffect(() => {
    if (user) {
      getActiveProviders().then(active => {
        setProviders(active);
        if (active.length > 0 && !selectedProvider) setSelectedProvider(active[0].id);
      });
    }
  }, [user]);

  const normalizeAddress = (value: string) => {
    if (!value) return '';
    const match = value.match(/<([^>]+)>/);
    return (match ? match[1] : value).replace(/(^"|"$)/g, '').trim().toLowerCase();
  };

  const getEmailPreview = (email: InboundEmail, maxLen = 150) => {
    const source = email.html_content || email.content || '';
    if (!source) return 'Aucun aperçu disponible';
    try {
      const doc = new DOMParser().parseFromString(source, 'text/html');
      const text = (doc.body?.innerText || doc.textContent || '').replace(/\s+/g, ' ').trim();
      return text ? (text.length > maxLen ? `${text.slice(0, maxLen)}…` : text) : 'Aucun aperçu disponible';
    } catch {
      const fallback = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return fallback.length > maxLen ? `${fallback.slice(0, maxLen)}…` : (fallback || 'Aucun aperçu disponible');
    }
  };

  const loadInboundEmails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: accounts } = await supabase.from('email_accounts').select('email').eq('is_active', true);
      const myEmails = Array.from(new Set([
        ...(accounts?.map((a: any) => a.email) || []),
        user.email || '', 'booking@fatras.net', 'fatrasplanning@gmail.com'
      ].filter(Boolean))).map((e: string) => e.toLowerCase());
      setAccountEmails(myEmails);

      const { data, error } = await supabase.from('inbound_emails').select('*')
        .eq('direction', 'received')
        .not('labels', 'ov', '{"Sent","Envoyés","INBOX.Sent","Sent Items","[Gmail]/Sent Mail","Sent Messages","[Gmail]/Messages envoyés"}')
        .order('received_at', { ascending: false }).limit(100);
      if (error) throw error;

      const sentLabelSet = new Set(['sent','envoyés','inbox.sent','sent items','[gmail]/sent mail','sent messages','[gmail]/messages envoyés']);
      setInboundEmails((data || []).filter((e: InboundEmail) => {
        const from = normalizeAddress(e.from_email || '');
        return !myEmails.includes(from) && !(e.labels || []).some(l => sentLabelSet.has((l || '').toLowerCase()));
      }));
    } catch { toast.error('Erreur lors du chargement des emails'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'inbox') loadInboundEmails(); }, [activeTab, user]);

  const syncGmail = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: settings } = await supabase.from('app_settings').select('setting_value').eq('setting_key', 'email_gmail_access_token').single();
      if (!settings?.setting_value) { toast.error('Token Gmail non configuré'); return; }
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { userId: user.id, accessToken: settings.setting_value, action: 'sync' }
      });
      if (error) throw error;
      if (data.success) { toast.success(`${data.syncedCount} nouveaux emails synchronisés`); await loadInboundEmails(); }
      else throw new Error(data.error);
    } catch { toast.error('Erreur lors de la synchronisation Gmail'); }
    finally { setLoading(false); }
  };

  const handleSendEmail = async () => {
    if (!draft.to || !draft.subject) { toast.error('Destinataire et sujet requis'); return; }
    try {
      const result = await sendEmail({
        to: draft.to.split(',').map(e => e.trim()),
        cc: draft.cc ? draft.cc.split(',').map(e => e.trim()) : undefined,
        bcc: draft.bcc ? draft.bcc.split(',').map(e => e.trim()) : undefined,
        subject: draft.subject,
        html: draft.isHtml ? draft.body : `<pre>${draft.body}</pre>`,
        text: draft.isHtml ? undefined : draft.body,
        fromName: draft.fromName
      }, selectedProvider);
      if (result.success) {
        setDraft({ to: '', cc: '', bcc: '', subject: '', body: '', fromName: user?.email?.split('@')[0] || 'Expéditeur', isHtml: false });
        toast.success('Email envoyé avec succès !');
      } else { toast.error(result.error || "Erreur lors de l'envoi"); }
    } catch { toast.error("Erreur lors de l'envoi de l'email"); }
  };

  const markAsRead = async (email: InboundEmail) => {
    try {
      await supabase.from('inbound_emails').update({ read_at: new Date().toISOString() }).eq('id', email.id);
      setInboundEmails(prev => prev.map(e => e.id === email.id ? { ...e, read_at: new Date().toISOString() } : e));
      if (email.message_id) {
        supabase.functions.invoke('nylas-email', { body: { action: 'mark_as_read', messageId: email.message_id } }).catch(() => {});
      }
    } catch {}
  };

  const confirmAction = useConfirm();
  const handleDelete = async (email: InboundEmail) => {
    const ok = await confirmAction({ title: "Supprimer l'email", description: 'Voulez-vous vraiment supprimer cet email ?', variant: 'destructive' });
    if (!ok) return;
    try {
      await supabase.from('inbound_emails').delete().eq('id', email.id);
      setInboundEmails(prev => prev.filter(e => e.id !== email.id));
      toast.success('Email supprimé');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const openComposer = (mode: 'reply' | 'forward', email: InboundEmail) => {
    setComposerSourceEmail(email);
    setComposerMode(mode);
    setShowComposer(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Interface Email Unifiée</h2>
        </div>
        {providers.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {providers.length} fournisseur{providers.length > 1 ? 's' : ''} actif{providers.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {providers.length === 0 && (
        <Alert><Settings className="h-4 w-4" /><AlertDescription>
          Aucun fournisseur d'email configuré. Configurez au moins un fournisseur dans les paramètres pour envoyer des emails.
        </AlertDescription></Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2"><Plus className="h-4 w-4" />Composer</TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />Boîte de réception
            {inboundEmails.filter(e => !e.read_at).length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">{inboundEmails.filter(e => !e.read_at).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2"><Archive className="h-4 w-4" />Envoyés</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <EmailComposeTab draft={draft} onDraftChange={setDraft} providers={providers}
            selectedProvider={selectedProvider} onProviderChange={setSelectedProvider}
            sending={sending} onSend={handleSendEmail} />
        </TabsContent>

        <TabsContent value="inbox">
          <EmailInbox emails={inboundEmails} loading={loading} onSync={syncGmail}
            onMarkAsRead={markAsRead} onReply={(e) => openComposer('reply', e)}
            onForward={(e) => openComposer('forward', e)} onDelete={handleDelete}
            getEmailPreview={getEmailPreview} />
        </TabsContent>

        <TabsContent value="sent">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5" />Emails envoyés</CardTitle>
            <CardDescription>Historique de vos emails envoyés</CardDescription></CardHeader>
            <CardContent><div className="text-center py-8 text-muted-foreground">Fonctionnalité en cours de développement</div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configuration des emails</CardTitle>
            <CardDescription>Gérez vos fournisseurs d'email et paramètres</CardDescription></CardHeader>
            <CardContent><div className="text-center py-8 text-muted-foreground">
              Utilisez l'onglet "Configuration des fournisseurs d'email" dans les préférences pour configurer vos comptes email.
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showComposer && (
        <EmailComposer isOpen={showComposer}
          onClose={() => { setShowComposer(false); setComposerMode(null); setComposerSourceEmail(null); }}
          toEmail={composerMode === 'reply' ? (composerSourceEmail?.from_email ?? '') : ''}
          subject={composerMode === 'reply' ? `Re: ${composerSourceEmail?.subject ?? ''}` : composerMode === 'forward' ? `Fwd: ${composerSourceEmail?.subject ?? ''}` : ''}
          preText={composerMode === 'forward'
            ? `\n\n---------- Message transféré ----------\nDe: ${composerSourceEmail?.from_email ?? ''}\nDate: ${composerSourceEmail ? new Date(composerSourceEmail.received_at).toLocaleString('fr-FR') : ''}\nObjet: ${composerSourceEmail?.subject ?? ''}\n\n${composerSourceEmail?.content ?? ''}`
            : composerMode === 'reply'
            ? `\n\n---------- Message original ----------\nDe: ${composerSourceEmail?.from_email ?? ''}\nDate: ${composerSourceEmail ? new Date(composerSourceEmail.received_at).toLocaleString('fr-FR') : ''}\n\n${composerSourceEmail?.content ?? ''}`
            : ''} />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Star, 
  Trash2, 
  Plus,
  RefreshCw,
  Settings,
  Eye,
  Clock
} from 'lucide-react';
import { useEmailSystem } from '@/hooks/useEmailSystem';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const { 
    sendEmail, 
    getActiveProviders, 
    getEmailHistory, 
    sending 
  } = useEmailSystem();

  const [activeTab, setActiveTab] = useState('compose');
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [inboundEmails, setInboundEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountEmails, setAccountEmails] = useState<string[]>([]);

  // État du brouillon d'email
  const [draft, setDraft] = useState<EmailDraft>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    fromName: user?.email?.split('@')[0] || 'Expéditeur',
    isHtml: false
  });

  // Charger les fournisseurs actifs
  useEffect(() => {
    const loadProviders = async () => {
      const activeProviders = await getActiveProviders();
      setProviders(activeProviders);
      if (activeProviders.length > 0 && !selectedProvider) {
        setSelectedProvider(activeProviders[0].id);
      }
    };

    if (user) {
      loadProviders();
    }
  }, [user]);

  // Convertit le HTML (ou texte) en extrait lisible
  const getEmailPreview = (email: InboundEmail, maxLen = 150) => {
    const source = email.html_content || email.content || '';
    if (!source) return 'Aucun aperçu disponible';
    try {
      // Utilise DOMParser pour récupérer uniquement le texte du <body>
      const parser = new DOMParser();
      const doc = parser.parseFromString(source, 'text/html');
      const text = (doc.body?.innerText || doc.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) return 'Aucun aperçu disponible';
      return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
    } catch (e) {
      // Fallback regex au cas où
      const fallback = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return fallback.length > maxLen ? `${fallback.slice(0, maxLen)}…` : (fallback || 'Aucun aperçu disponible');
    }
  };

  // Charger les emails entrants
  const loadInboundEmails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupère les adresses des comptes email actifs de l'utilisateur
      const { data: accounts } = await supabase
        .from('email_accounts')
        .select('email')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const myEmails = Array.from(new Set([
        ...(accounts?.map((a: any) => a.email) || []),
        user.email || ''
      ].filter(Boolean))).map((e: string) => e.toLowerCase());
      setAccountEmails(myEmails);

      // Charge les emails "reçus" et exclut côté serveur les dossiers d'envoi courants
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('direction', 'received')
        .not('labels', 'cs', '{"Sent","Envoyés","INBOX.Sent","Sent Items","[Gmail]/Sent Mail","Sent Messages","[Gmail]/Messages envoyés"}')
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const sentLabelSet = new Set([
        'sent','envoyés','inbox.sent','sent items','[gmail]/sent mail','sent messages','[gmail]/messages envoyés'
      ]);

      // Filtre côté client si nécessaire
      const filtered = (data || []).filter((e: InboundEmail) => {
        const from = (e.from_email || '').toLowerCase();
        const hasSentLabel = (e.labels || []).some(l => sentLabelSet.has((l || '').toLowerCase()));
        return !myEmails.includes(from) && !hasSentLabel;
      });

      setInboundEmails(filtered);
    } catch (error) {
      console.error('Erreur chargement emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inbox') {
      loadInboundEmails();
    }
  }, [activeTab, user]);

  // Synchroniser Gmail
  const syncGmail = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer le token Gmail depuis les paramètres
      const { data: settings } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('user_id', user.id)
        .eq('setting_key', 'email_gmail_access_token')
        .single();

      if (!settings?.setting_value) {
        toast.error('Token Gmail non configuré');
        return;
      }

      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          userId: user.id,
          accessToken: settings.setting_value,
          action: 'sync'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${data.syncedCount} nouveaux emails synchronisés`);
        await loadInboundEmails();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erreur sync Gmail:', error);
      toast.error('Erreur lors de la synchronisation Gmail');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer l'email
  const handleSendEmail = async () => {
    if (!draft.to || !draft.subject) {
      toast.error('Destinataire et sujet requis');
      return;
    }

    try {
      const emailMessage = {
        to: draft.to.split(',').map(email => email.trim()),
        cc: draft.cc ? draft.cc.split(',').map(email => email.trim()) : undefined,
        bcc: draft.bcc ? draft.bcc.split(',').map(email => email.trim()) : undefined,
        subject: draft.subject,
        html: draft.isHtml ? draft.body : `<pre>${draft.body}</pre>`,
        text: draft.isHtml ? undefined : draft.body,
        fromName: draft.fromName
      };

      const result = await sendEmail(emailMessage, selectedProvider);

      if (result.success) {
        // Réinitialiser le brouillon
        setDraft({
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: '',
          fromName: user?.email?.split('@')[0] || 'Expéditeur',
          isHtml: false
        });
        
        toast.success('Email envoyé avec succès !');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  // Marquer un email comme lu
  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ read_at: new Date().toISOString() })
        .eq('id', emailId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setInboundEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, read_at: new Date().toISOString() }
            : email
        )
      );
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Interface Email Unifiée</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {providers.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {providers.length} fournisseur{providers.length > 1 ? 's' : ''} actif{providers.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {providers.length === 0 && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Aucun fournisseur d'email configuré. 
            Configurez au moins un fournisseur dans les paramètres pour envoyer des emails.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Composer
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Boîte de réception
            {inboundEmails.filter(e => !e.read_at).length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {inboundEmails.filter(e => !e.read_at).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Envoyés
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Composer un email */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Composer un email
              </CardTitle>
              <CardDescription>
                Rédigez et envoyez un email via votre fournisseur préféré
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <Label htmlFor="to">Destinataire(s) *</Label>
                <Input
                  id="to"
                  type="email"
                  value={draft.to}
                  onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                  placeholder="email@exemple.com, autre@exemple.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">Nom d'expéditeur (alias)</Label>
                  <Input
                    id="fromName"
                    value={draft.fromName}
                    onChange={(e) => setDraft({ ...draft, fromName: e.target.value })}
                    placeholder="Votre nom ou alias"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Fournisseur d'envoi</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir le fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    type="email"
                    value={draft.cc}
                    onChange={(e) => setDraft({ ...draft, cc: e.target.value })}
                    placeholder="Copie conforme"
                  />
                </div>
                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={draft.bcc}
                    onChange={(e) => setDraft({ ...draft, bcc: e.target.value })}
                    placeholder="Copie cachée"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Sujet *</Label>
                <Input
                  id="subject"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Contenu de votre email..."
                  rows={12}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHtml"
                    checked={draft.isHtml}
                    onChange={(e) => setDraft({ ...draft, isHtml: e.target.checked })}
                  />
                  <Label htmlFor="isHtml">Format HTML</Label>
                </div>

                <Button 
                  onClick={handleSendEmail}
                  disabled={sending || !draft.to || !draft.subject || providers.length === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boîte de réception */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Inbox className="h-5 w-5" />
                    Boîte de réception
                  </CardTitle>
                  <CardDescription>
                    {inboundEmails.length} email{inboundEmails.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncGmail}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Synchroniser Gmail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : inboundEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun email dans la boîte de réception
                </div>
              ) : (
                <div className="space-y-2">
                  {inboundEmails.map(email => (
                    <div
                      key={email.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        !email.read_at ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(email.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{email.from_email}</span>
                          {!email.read_at && (
                            <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {email.provider}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(email.received_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="font-medium mb-1">{email.subject}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {getEmailPreview(email)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails envoyés */}
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Emails envoyés
              </CardTitle>
              <CardDescription>
                Historique de vos emails envoyés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Fonctionnalité en cours de développement
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration des emails
              </CardTitle>
              <CardDescription>
                Gérez vos fournisseurs d'email et paramètres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Utilisez l'onglet "Configuration des fournisseurs d'email" dans les préférences
                pour configurer vos comptes email.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
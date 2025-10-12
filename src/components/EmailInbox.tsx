import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mail, RefreshCw, Clock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailSync } from '@/hooks/useEmailSync';
import { toast } from 'sonner';

interface InboundEmail {
  id: string;
  message_id: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  content: string;
  html_content?: string;
  received_at: string;
  read_at?: string;
  provider: string;
  labels: string[];
}

export const EmailInbox: React.FC = () => {
  const { user } = useAuth();
  const { syncEmails, isLoading: isSyncing } = useEmailSync();
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Utils
  const normalizeAddress = (value: string) => {
    if (!value) return '';
    const match = value.match(/<([^>]+)>/);
    const email = match ? match[1] : value;
    return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
  };

  const decodeHtmlEntities = (str: string) => {
    if (!str) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value || textarea.textContent || str;
  };

  useEffect(() => {
    if (user) {
      loadEmails();
    }
  }, [user]);

  const loadEmails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 1) Récupérer d'abord les adresses de vos comptes pour pouvoir exclure côté serveur
      const { data: accounts } = await supabase
        .from('email_accounts')
        .select('email')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const myEmails = Array.from(new Set([
        ...(accounts?.map((a: any) => a.email) || []),
        user.email || ''
      ].filter(Boolean))).map((e: string) => e.toLowerCase());

      // 2) Charger uniquement les emails reçus et exclure au maximum côté serveur
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('direction', 'received')
        // Exclure les dossiers d'envoi les plus courants (chevauchement de labels)
        .not('labels', 'ov', '{"Sent","Envoyés","INBOX.Sent","Sent Items","[Gmail]/Sent Mail","Sent Messages","[Gmail]/Messages envoyés"}')
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // 3) Filtre additionnel côté client si besoin
      const sentLabelSet = new Set([
        'sent','envoyés','inbox.sent','sent items','[gmail]/sent mail','sent messages','[gmail]/messages envoyés','outbox'
      ]);

      const filtered = (data || []).filter((e: InboundEmail) => {
        const from = normalizeAddress(e.from_email);
        const hasSentLabel = (e.labels || []).some(l => sentLabelSet.has((l || '').toLowerCase()));
        return !myEmails.includes(from) && !hasSentLabel;
      });

      setEmails(filtered);
    } catch (error) {
      console.error('Erreur lors du chargement des emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (email: InboundEmail) => {
    if (email.read_at) return;

    try {
      const { error } = await supabase
        .from('inbound_emails')
        .update({ read_at: new Date().toISOString() })
        .eq('id', email.id);

      if (error) throw error;

      // Mettre à jour l'état local
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, read_at: new Date().toISOString() } : e
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleEmailClick = (email: InboundEmail) => {
    setSelectedEmail(email);
    markAsRead(email);
  };

  const handleSyncEmails = async () => {
    try {
      console.log('🔄 Démarrage de la synchronisation des emails...');
      await syncEmails();
      console.log('✅ Synchronisation terminée, rechargement des emails...');
      await loadEmails();
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      // L'erreur est déjà gérée dans useEmailSync
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Convertit le HTML (ou texte) en extrait lisible
  const getEmailPreview = (email: InboundEmail, maxLen = 140) => {
    const raw = email.html_content || email.content || '';
    if (!raw) return '(Aucun contenu)';
    try {
      let source = raw;
      // Décoder les entités HTML si nécessaire (&lt;html ...)
      if (/&lt;|&gt;|&amp;|&#/i.test(source)) {
        source = decodeHtmlEntities(source);
      }
      // Si on détecte de l'HTML, parser et extraire uniquement le texte du <body>
      if (/<[a-z!/]/i.test(source)) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(source, 'text/html');
        const text = (doc.body?.innerText || doc.textContent || '')
          .replace(/\s+/g, ' ')
          .trim();
        if (text) return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
      }
      // Sinon, nettoyer en supprimant les balises éventuelles
      const plain = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : (plain || '(Aucun contenu)');
    } catch (e) {
      const fallback = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return fallback.length > maxLen ? `${fallback.slice(0, maxLen)}…` : (fallback || '(Aucun contenu)');
    }
  };

  const unreadCount = emails.filter(email => !email.read_at).length;

  if (selectedEmail) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEmail(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h3 className="font-semibold truncate">{selectedEmail.subject}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{selectedEmail.from_name || selectedEmail.from_email}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{new Date(selectedEmail.received_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-1">
                <div><strong>De :</strong> {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}</div>
                <div><strong>À :</strong> {selectedEmail.to_email}</div>
                <div><strong>Sujet :</strong> {selectedEmail.subject}</div>
                <div><strong>Date :</strong> {new Date(selectedEmail.received_at).toLocaleString('fr-FR')}</div>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {selectedEmail.html_content ? (
                <div className="bg-white p-4 rounded border">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }} />
                </div>
              ) : (
                <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded">{selectedEmail.content}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Boîte de réception
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={handleSyncEmails}
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sync...' : 'Synchroniser'}
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Chargement des emails...
            </div>
          ) : emails.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucun email trouvé</p>
              <p className="text-sm mb-4">
                Pour recevoir vos emails, configurez d'abord votre compte IMAP dans les Préférences → Email
              </p>
              <div className="space-y-2 text-xs text-left bg-muted/50 p-3 rounded">
                <p><strong>Étapes de configuration :</strong></p>
                <p>1. Allez dans Préférences → Email</p>
                <p>2. Configurez votre serveur IMAP (ex: pro1.mail.ovh.net:993)</p>
                <p>3. Testez la connexion</p>
                <p>4. Revenez ici et cliquez sur "Synchroniser"</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !email.read_at ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleEmailClick(email)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium truncate ${!email.read_at ? 'font-semibold' : ''}`}>
                          {email.from_name || email.from_email}
                        </span>
                        {!email.read_at && (
                          <Badge variant="outline" className="text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <h4 className={`text-sm truncate mb-1 ${!email.read_at ? 'font-semibold' : ''}`}>
                        {email.subject || '(Aucun sujet)'}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {getEmailPreview(email)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(email.received_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EmailInbox;
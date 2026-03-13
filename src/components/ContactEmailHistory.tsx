import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Inbox, Clock, User, RefreshCw, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedEmails } from '@/hooks/useUnifiedEmails';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EmailComposer } from '@/components/email/EmailComposer';
import { sanitizeEmailHtml } from '@/lib/sanitize';

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

  // Recharger les emails quand le composant est monté et quand contactId/contactEmail change
  React.useEffect(() => {
    if (contactId || normalizedContactEmail) {
      loadEmails({
        contactId,
        contactEmail: normalizedContactEmail,
        limit: 500,
      });
    }
  }, [contactId, normalizedContactEmail]);

  const stripTags = (s: string) => s ? s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  const getPreviewText = (email: any) => {
    const base = email?.html_content || email?.content || '';
    return stripTags(base).slice(0, 120);
  };
  // Using sanitizeEmailHtml from @/lib/sanitize instead of inline function

  // Filter emails for this specific contact - memoized to avoid recalculating on every render
  const contactEmails = React.useMemo(() => 
    emails.filter(email => {
      if (email.contact_id === contactId) return true;
      if (!normalizedContactEmail) return false;

      const fromEmail = normalizeAddress(email.from_email);
      const toEmail = normalizeAddress(email.to_email);
      return fromEmail === normalizedContactEmail || toEmail === normalizedContactEmail;
    }), [emails, contactId, normalizedContactEmail, normalizeAddress]);

  const receivedEmails = React.useMemo(() => 
    contactEmails.filter(email => email.direction === 'received'), 
    [contactEmails]);
  
  const sentEmails = React.useMemo(() => 
    contactEmails.filter(email => email.direction === 'sent'), 
    [contactEmails]);

  const handleSync = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncNow({ contactId, contactEmail: normalizedContactEmail, limit: 500 });
      await loadEmails({ contactId, contactEmail: normalizedContactEmail, limit: 500 });
    } finally {
      setIsSyncing(false);
    }
  }, [syncNow, loadEmails, contactId, normalizedContactEmail]);

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
              {email.direction === 'received' && !email.read_at && (
                <Badge variant="outline" className="text-xs">
                  Nouveau
                </Badge>
              )}
            </div>
            
            <h4 className={`text-sm font-medium line-clamp-2 mb-1 ${
              email.direction === 'received' && !email.read_at ? 'font-semibold' : ''
            }`}>
              {email.subject || '(Aucun sujet)'}
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
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
              {selectedEmail?.subject || '(Aucun sujet)'}
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="flex flex-col gap-1 text-sm">
                <div><strong>De:</strong> {selectedEmail?.from_name || selectedEmail?.from_email}</div>
                <div><strong>À:</strong> {selectedEmail?.to_name || selectedEmail?.to_email}</div>
                <div><strong>Date:</strong> {selectedEmail && formatDate(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at)}</div>
                <div><strong>Provider:</strong> {selectedEmail?.provider}</div>
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
        subject={`Re: ${selectedEmail?.subject || ''}`}
        preText={`\n\n---\nDe: ${selectedEmail?.from_name || selectedEmail?.from_email}\nDate: ${selectedEmail && formatDate(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at)}\n\n${stripTags(selectedEmail?.html_content || selectedEmail?.content || '')}`}
      />
    </>
  );
};
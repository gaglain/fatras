import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, Inbox, Clock, User } from 'lucide-react';
import { useUnifiedEmails } from '@/hooks/useUnifiedEmails';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ContactEmailHistoryProps {
  contactId: string;
  contactEmail?: string;
}

export const ContactEmailHistory: React.FC<ContactEmailHistoryProps> = ({ 
  contactId, 
  contactEmail 
}) => {
  const { emails, isLoading, loadEmails, markAsRead } = useUnifiedEmails();
  const [selectedEmail, setSelectedEmail] = React.useState<any | null>(null);

  const stripTags = (s: string) => s ? s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  const getPreviewText = (email: any) => {
    const base = email?.html_content || email?.content || '';
    return stripTags(base).slice(0, 120);
  };
  const sanitizeHtml = (s: string) => s ? s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') : '';

  React.useEffect(() => {
    loadEmails();
  }, []);

  // Filter emails for this specific contact
  const contactEmails = emails.filter(email => 
    email.contact_id === contactId || 
    (contactEmail && (email.from_email === contactEmail || email.to_email === contactEmail))
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Historique des emails
          {contactEmails.length > 0 && (
            <Badge variant="secondary">{contactEmails.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contactEmails.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucun email trouvé</p>
            <p className="text-sm">Les échanges d'emails avec ce contact apparaîtront ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {contactEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    email.direction === 'received' && !email.read_at 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200' 
                      : 'border-border'
                  }`}
                  onClick={() => handleEmailClick(email)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {email.direction === 'received' ? (
                          <Inbox className="h-3 w-3 text-green-600" />
                        ) : (
                          <Send className="h-3 w-3 text-blue-600" />
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
                      
                      <h4 className={`text-sm font-medium truncate mb-1 ${
                        email.direction === 'received' && !email.read_at ? 'font-semibold' : ''
                      }`}>
                        {email.subject || '(Aucun sujet)'}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {email.content?.substring(0, 120)}...
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDate(email.received_at || email.sent_at || email.created_at)}
                        </span>
                        <User className="h-3 w-3 ml-2" />
                        <span>
                          {email.direction === 'received' 
                            ? (email.from_name || email.from_email)
                            : (email.to_name || email.to_email)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
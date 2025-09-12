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

  useEffect(() => {
    if (user) {
      loadEmails();
    }
  }, [user]);

  const loadEmails = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inbound_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setEmails(data || []);
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
      await syncEmails();
      await loadEmails();
    } catch (error) {
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
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }} />
              ) : (
                <div className="whitespace-pre-wrap">{selectedEmail.content}</div>
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
              <p>Aucun email trouvé</p>
              <p className="text-sm">Cliquez sur "Synchroniser" pour récupérer vos emails</p>
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
                        {email.content.substring(0, 100)}...
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
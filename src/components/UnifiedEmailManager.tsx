import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Inbox, 
  Clock, 
  User, 
  ArrowLeft, 
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';
import { useUnifiedEmails, UnifiedEmail } from '@/hooks/useUnifiedEmails';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useNylasEmail } from '@/hooks/useNylasEmail';

export const UnifiedEmailManager: React.FC = () => {
  const { emails, isLoading, loadEmails, markAsRead, getEmailsByDirection, getUnreadCount } = useUnifiedEmails();
  const { notifications, markAsRead: markNotificationAsRead, markAllAsRead, getUnreadCount: getNotificationUnreadCount } = useEmailNotifications();
  const { syncEmails, accounts, isLoading: isSyncing } = useNylasEmail();
  const [selectedEmail, setSelectedEmail] = useState<UnifiedEmail | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');

  // Utils: clean preview from HTML
  const decodeHtmlEntities = (str: string) => {
    if (!str) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value || textarea.textContent || str;
  };
  const getEmailPreview = (email: UnifiedEmail, maxLen = 140) => {
    let raw = email.html_content || email.content || '';
    if (!raw) return '(Aucun contenu)';
    try {
      if (/&lt;|&gt;|&amp;|&#/i.test(raw)) raw = decodeHtmlEntities(raw);
      const plain = raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : (plain || '(Aucun contenu)');
    } catch {
      const fallback = (email.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return fallback.length > maxLen ? `${fallback.slice(0, maxLen)}…` : (fallback || '(Aucun contenu)');
    }
  };

  const handleEmailClick = (email: UnifiedEmail) => {
    setSelectedEmail(email);
    if (email.direction === 'received' && !email.read_at) {
      markAsRead(email.id);
    }
  };

  const handleSyncEmails = async () => {
    if (accounts.length > 0) {
      try {
        await syncEmails(accounts[0].id);
        await loadEmails();
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
      }
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

  const renderEmailList = (emailList: UnifiedEmail[], title: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary">{emailList.length}</Badge>
        </div>
        <Button
          onClick={handleSyncEmails}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      </div>
      
      <ScrollArea className="h-[500px]">
        {emailList.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun email trouvé</p>
          </div>
        ) : (
          <div className="divide-y">
            {emailList.map((email) => (
              <div
                key={email.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  email.direction === 'received' && !email.read_at 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500' 
                    : ''
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium truncate ${
                        email.direction === 'received' && !email.read_at ? 'font-semibold' : ''
                      }`}>
                        {email.direction === 'received' 
                          ? (email.from_name || email.from_email)
                          : (email.to_name || email.to_email)
                        }
                      </span>
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
                    <h4 className={`text-sm truncate mb-1 ${
                      email.direction === 'received' && !email.read_at ? 'font-semibold' : ''
                    }`}>
                      {email.subject || '(Aucun sujet)'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {getEmailPreview(email)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(email.received_at || email.sent_at || email.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

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
                <span>
                  {selectedEmail.direction === 'received' 
                    ? `De: ${selectedEmail.from_name || selectedEmail.from_email}`
                    : `À: ${selectedEmail.to_name || selectedEmail.to_email}`
                  }
                </span>
                <Clock className="h-3 w-3 ml-2" />
                <span>
                  {new Date(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at)
                    .toLocaleString('fr-FR')}
                </span>
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
                <div><strong>Date :</strong> {new Date(selectedEmail.received_at || selectedEmail.sent_at || selectedEmail.created_at).toLocaleString('fr-FR')}</div>
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
            Gestionnaire Email Unifié
            {getUnreadCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getUnreadCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={getNotificationUnreadCount() === 0}
            >
              {getNotificationUnreadCount() > 0 ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              {getNotificationUnreadCount() > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {getNotificationUnreadCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Boîte de réception
              {getEmailsByDirection('received').filter(e => !e.read_at).length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {getEmailsByDirection('received').filter(e => !e.read_at).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyés
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Tous
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inbox" className="p-4">
            {renderEmailList(
              getEmailsByDirection('received'), 
              'Emails reçus', 
              <Inbox className="h-4 w-4" />
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="p-4">
            {renderEmailList(
              getEmailsByDirection('sent'), 
              'Emails envoyés', 
              <Send className="h-4 w-4" />
            )}
          </TabsContent>
          
          <TabsContent value="all" className="p-4">
            {renderEmailList(
              emails, 
              'Tous les emails', 
              <Mail className="h-4 w-4" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
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
  BellOff,
  Reply,
  Forward,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmailComposer } from '@/components/email/EmailComposer';
import { useUnifiedEmails, UnifiedEmail } from '@/hooks/useUnifiedEmails';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmailHtml } from '@/lib/sanitize';

export const UnifiedEmailManager: React.FC = () => {
  const { emails, isLoading, loadEmails, markAsRead, getEmailsByDirection, getUnreadCount } = useUnifiedEmails();
  const { notifications, markAsRead: markNotificationAsRead, markAllAsRead, getUnreadCount: getNotificationUnreadCount } = useEmailNotifications();
  const { syncEmails, accounts, isLoading: isSyncing } = useNylasEmail();
  const [selectedEmail, setSelectedEmail] = useState<UnifiedEmail | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [filter, setFilter] = useState<'all' | 'spam'>('all');
  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState<'reply' | 'forward' | null>(null);
  const [composerSourceEmail, setComposerSourceEmail] = useState<UnifiedEmail | null>(null);

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

  // Actions rapides
  const handleReply = (email: UnifiedEmail) => {
    setComposerSourceEmail(email);
    setComposerMode('reply');
    setShowComposer(true);
  };

  const handleForward = (email: UnifiedEmail) => {
    setComposerSourceEmail(email);
    setComposerMode('forward');
    setShowComposer(true);
  };

  const handleDelete = async (email: UnifiedEmail) => {
    if (!confirm('Voulez-vous vraiment supprimer cet email ?')) return;
    try {
      if (email.direction === 'received') {
        await supabase.from('inbound_emails').delete().eq('id', email.id);
      } else {
        await supabase.from('emails').delete().eq('id', email.id);
      }
      await loadEmails();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const renderEmailList = (emailList: UnifiedEmail[], title: string, icon: React.ReactNode) => {
    const spamEmails = emailList.filter(e => (e.labels || []).some(l => /spam|junk/i.test(l || '')));
    const displayed = filter === 'spam'
      ? spamEmails
      : emailList.filter(e => !(e.labels || []).some(l => /spam|junk/i.test(l || '')));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="secondary">{displayed.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Button size="sm" variant={filter === 'all' ? 'secondary' : 'outline'} onClick={() => setFilter('all')}>
                Tous ({emailList.length - spamEmails.length})
              </Button>
              <Button size="sm" variant={filter === 'spam' ? 'destructive' : 'outline'} onClick={() => setFilter('spam')}>
                Spam ({spamEmails.length})
              </Button>
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
        </div>
        <ScrollArea className="h-[500px]">
          {displayed.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun email trouvé</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayed.map((email) => (
                <div
                  key={email.id}
                  className={`group p-4 hover:bg-muted/50 transition-colors ${
                    email.direction === 'received' && !email.read_at 
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEmailClick(email)}>
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(email.received_at || email.sent_at || email.created_at)}
                      </div>
                      <div className="hidden md:flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Répondre"
                          onClick={(e) => { e.stopPropagation(); handleReply(email); }}>
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Transférer"
                          onClick={(e) => { e.stopPropagation(); handleForward(email); }}>
                          <Forward className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Supprimer"
                          onClick={(e) => { e.stopPropagation(); handleDelete(email); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild className="md:hidden">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-popover border">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReply(email); }}>
                            <Reply className="h-4 w-4 mr-2" />
                            Répondre
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleForward(email); }}>
                            <Forward className="h-4 w-4 mr-2" />
                            Transférer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(email); }} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

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
                <div dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(selectedEmail.html_content) }} />
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
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="truncate">Emails</span>
            {getUnreadCount() > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {getUnreadCount()}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={getNotificationUnreadCount() === 0}
            className="shrink-0"
          >
            {getNotificationUnreadCount() > 0 ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {getNotificationUnreadCount() > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {getNotificationUnreadCount()}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="inbox" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <Inbox className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Réception</span>
              {getEmailsByDirection('received').filter(e => !e.read_at).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {getEmailsByDirection('received').filter(e => !e.read_at).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <Send className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Envoyés</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-1 px-2 py-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Tous</span>
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
      {showComposer && (
        <EmailComposer
          isOpen={showComposer}
          onClose={() => {
            setShowComposer(false);
            setComposerMode(null);
            setComposerSourceEmail(null);
          }}
          toEmail={composerMode === 'reply' ? (composerSourceEmail?.from_email ?? '') : ''}
          subject={
            composerMode === 'reply'
              ? `Re: ${composerSourceEmail?.subject ?? ''}`
              : composerMode === 'forward'
              ? `Fwd: ${composerSourceEmail?.subject ?? ''}`
              : ''
          }
          preText={
            composerMode === 'forward'
              ? `\n\n---------- Message transféré ----------\nDe: ${composerSourceEmail?.from_email ?? ''}\nDate: ${composerSourceEmail ? new Date(composerSourceEmail.received_at || composerSourceEmail.sent_at || composerSourceEmail.created_at).toLocaleString('fr-FR') : ''}\nObjet: ${composerSourceEmail?.subject ?? ''}\n\n${composerSourceEmail?.content ?? ''}`
              : composerMode === 'reply'
              ? `\n\n---------- Message original ----------\nDe: ${composerSourceEmail?.from_email ?? ''}\nDate: ${composerSourceEmail ? new Date(composerSourceEmail.received_at || composerSourceEmail.sent_at || composerSourceEmail.created_at).toLocaleString('fr-FR') : ''}\n\n${composerSourceEmail?.content ?? ''}`
              : ''
          }
        />
      )}
    </Card>
  );
};
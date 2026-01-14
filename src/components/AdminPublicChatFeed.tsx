import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, Clock, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  message: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: ChatMessage[];
}

interface AdminPublicChatFeedProps {
  initialVisitorId?: string;
}

export const AdminPublicChatFeed: React.FC<AdminPublicChatFeedProps> = ({ initialVisitorId }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialVisitorId || null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load all conversations
  const loadConversations = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('public_chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Erreur lors du chargement des messages');
      setIsLoading(false);
      return;
    }

    // Group messages by visitor_id
    const grouped = (data as ChatMessage[]).reduce((acc, msg) => {
      if (!acc[msg.visitor_id]) {
        acc[msg.visitor_id] = {
          visitor_id: msg.visitor_id,
          visitor_name: msg.visitor_name,
          visitor_email: msg.visitor_email,
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread_count: 0,
          messages: []
        };
      }
      
      acc[msg.visitor_id].messages.push(msg);
      acc[msg.visitor_id].last_message = msg.message;
      acc[msg.visitor_id].last_message_at = msg.created_at;
      
      // Update visitor info from latest message
      if (msg.visitor_name) acc[msg.visitor_id].visitor_name = msg.visitor_name;
      if (msg.visitor_email) acc[msg.visitor_id].visitor_email = msg.visitor_email;
      
      // Count unread messages from visitors
      if (!msg.is_from_admin && !msg.is_read) {
        acc[msg.visitor_id].unread_count++;
      }
      
      return acc;
    }, {} as Record<string, Conversation>);

    // Sort by last message date (most recent first)
    const sortedConversations = Object.values(grouped).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    setConversations(sortedConversations);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-select conversation from navigation state
  useEffect(() => {
    if (initialVisitorId && conversations.length > 0 && !isLoading) {
      handleSelectConversation(initialVisitorId);
    }
  }, [initialVisitorId, conversations.length, isLoading]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channelName = `admin-chat-feed-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_chat_messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll when viewing conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, conversations]);

  // Mark messages as read when selecting a conversation
  const handleSelectConversation = async (visitorId: string) => {
    setSelectedConversation(visitorId);
    
    // Mark all messages from this visitor as read
    await supabase
      .from('public_chat_messages')
      .update({ is_read: true })
      .eq('visitor_id', visitorId)
      .eq('is_from_admin', false);
    
    // Update local state
    setConversations(prev => prev.map(c => 
      c.visitor_id === visitorId ? { ...c, unread_count: 0 } : c
    ));
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    
    const { error } = await supabase
      .from('public_chat_messages')
      .insert({
        visitor_id: selectedConversation,
        message: replyMessage.trim(),
        is_from_admin: true,
        admin_user_id: user.id,
        visitor_name: 'Support',
        is_read: true
      });

    if (error) {
      toast.error('Erreur lors de l\'envoi de la réponse');
    } else {
      setReplyMessage('');
      toast.success('Réponse envoyée');
      await loadConversations();
    }
    
    setIsSending(false);
  };

  const selectedConv = conversations.find(c => c.visitor_id === selectedConversation);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Composant liste des conversations
  const ConversationsList = () => (
    <Card className={isMobile ? "h-full" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            Conversations
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">{totalUnread}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={loadConversations} className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={isMobile ? "h-[calc(100vh-16rem)]" : "h-[500px]"}>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune conversation</p>
              <p className="text-xs mt-1">Les messages des visiteurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <div
                  key={conv.visitor_id}
                  className={`p-3 sm:p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted ${
                    selectedConversation === conv.visitor_id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSelectConversation(conv.visitor_id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="h-8 w-8 p-1.5 bg-primary/10 text-primary rounded-full shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conv.visitor_name || 'Visiteur anonyme'}
                        </p>
                        {conv.visitor_email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{conv.visitor_email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="shrink-0 text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">
                    {conv.last_message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(conv.last_message_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Composant vue des messages
  const MessagesView = () => (
    <Card className={`flex flex-col ${isMobile ? "h-full" : ""}`}>
      <CardHeader className="pb-3 border-b px-3 sm:px-6">
        {selectedConv ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={handleBackToList} className="h-8 w-8 -ml-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <User className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-primary/10 text-primary rounded-full flex-shrink-0" />
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">
                {selectedConv.visitor_name || 'Visiteur anonyme'}
              </CardTitle>
              {selectedConv.visitor_email && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedConv.visitor_email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <CardTitle className="text-base sm:text-lg text-muted-foreground">
            Sélectionnez une conversation
          </CardTitle>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {selectedConv ? (
          <>
            <ScrollArea className={`flex-1 p-3 sm:p-4 ${isMobile ? "h-[calc(100vh-22rem)]" : ""}`}>
              <div className="space-y-3">
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-lg ${
                        msg.is_from_admin
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(msg.created_at).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez votre réponse..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendReply()}
                  disabled={isSending}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSendReply}
                  disabled={isSending || !replyMessage.trim()}
                  size={isMobile ? "icon" : "default"}
                  className={isMobile ? "w-10 h-10 flex-shrink-0" : ""}
                >
                  <Send className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Envoyer</span>}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
            <div className="text-center">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sélectionnez une conversation pour voir les messages</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Mode mobile : affichage conditionnel liste/messages
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-12rem)]">
        {selectedConversation ? <MessagesView /> : <ConversationsList />}
      </div>
    );
  }

  // Mode desktop : grille côte à côte
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <div className="md:col-span-1">
        <ConversationsList />
      </div>
      <div className="md:col-span-2">
        <MessagesView />
      </div>
    </div>
  );
};
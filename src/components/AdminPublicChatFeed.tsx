import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, Clock, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

export const AdminPublicChatFeed: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load all conversations
  const loadConversations = async () => {
    setIsLoading(true);
    console.log('📨 Loading public chat messages...');
    
    const { data, error } = await supabase
      .from('public_chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    console.log('📨 Public chat result:', { data, error, count: data?.length });

    if (error) {
      console.error('❌ Error loading messages:', error);
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

  // Subscribe to realtime updates - unique channel name to avoid conflicts
  useEffect(() => {
    const channelName = `admin-chat-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_chat_messages'
        },
        (payload) => {
          console.log('🔔 New public chat message received:', payload);
          loadConversations();
          
          // Create notification for admin if message is from visitor
          const newMsg = payload.new as any;
          if (!newMsg.is_from_admin && user) {
            // Create notification in notifications table
            supabase.from('notifications').insert({
              user_id: user.id,
              type: 'public_chat',
              title: 'Nouveau message du site',
              message: `${newMsg.visitor_name || 'Un visiteur'} vous a envoyé un message`,
              read: false,
              data: { visitor_id: newMsg.visitor_id }
            }).then(({ error }) => {
              if (error) console.error('Error creating notification:', error);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
      console.error('Error sending reply:', error);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
              {totalUnread > 0 && (
                <Badge variant="destructive">{totalUnread}</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={loadConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Chargement...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.visitor_id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.visitor_id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conv.visitor_id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-8 w-8 p-1.5 bg-muted rounded-full shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {conv.visitor_name || 'Visiteur anonyme'}
                          </p>
                          {conv.visitor_email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {conv.visitor_email}
                            </p>
                          )}
                        </div>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
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

      {/* Messages View */}
      <Card className="md:col-span-2 flex flex-col">
        <CardHeader className="pb-3 border-b">
          {selectedConv ? (
            <div className="flex items-center gap-3">
              <User className="h-10 w-10 p-2 bg-muted rounded-full" />
              <div>
                <CardTitle className="text-lg">
                  {selectedConv.visitor_name || 'Visiteur anonyme'}
                </CardTitle>
                {selectedConv.visitor_email && (
                  <p className="text-sm text-muted-foreground">
                    {selectedConv.visitor_email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <CardTitle className="text-lg text-muted-foreground">
              Sélectionnez une conversation
            </CardTitle>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {selectedConv ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.is_from_admin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
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

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre réponse..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendReply()}
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendReply}
                    disabled={isSending || !replyMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez une conversation pour voir les messages</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
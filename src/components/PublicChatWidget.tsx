import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  message: string;
  is_from_admin: boolean;
  created_at: string;
}

// Generate or retrieve visitor ID from localStorage
const getVisitorId = (): string => {
  const stored = localStorage.getItem('chat_visitor_id');
  if (stored) return stored;
  
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chat_visitor_id', newId);
  return newId;
};

export const PublicChatWidget: React.FC = () => {
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [isIntroStep, setIsIntroStep] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorId] = useState(getVisitorId);

  // Load existing messages for this visitor
  useEffect(() => {
    if (!isOpen) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('public_chat_messages')
        .select('*')
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: true });

      if (data && !error) {
        setMessages(data as ChatMessage[]);
        // If there are existing messages, skip intro
        if (data.length > 0) {
          setIsIntroStep(false);
          // Restore visitor info from first message
          const firstMsg = data.find(m => !m.is_from_admin);
          if (firstMsg) {
            setVisitorName(firstMsg.visitor_name || '');
            setVisitorEmail(firstMsg.visitor_email || '');
          }
        }
      }
    };

    loadMessages();
  }, [isOpen, visitorId]);

  // Subscribe to realtime updates - use unique channel name per visitor
  useEffect(() => {
    if (!isOpen) return;

    const channelName = `public-chat-${visitorId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_chat_messages',
          filter: `visitor_id=eq.${visitorId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, visitorId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = () => {
    if (!visitorName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    setIsIntroStep(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from('public_chat_messages')
      .insert({
        visitor_id: visitorId,
        visitor_name: visitorName.trim() || 'Visiteur',
        visitor_email: visitorEmail.trim() || null,
        message: newMessage.trim(),
        is_from_admin: false
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } else {
      setNewMessage('');
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {/* Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "shadow-xl z-50 flex flex-col",
          isMobile 
            ? "fixed inset-0 rounded-none h-full w-full" 
            : "fixed bottom-6 right-6 w-96 h-[500px]"
        )}>
          <CardHeader className="pb-3 bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Support
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {isIntroStep ? (
              // Introduction step - collect visitor info
              <div className="flex-1 flex flex-col justify-center p-6 space-y-4">
                <div className="text-center mb-4">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-semibold text-lg">Bienvenue !</h3>
                  <p className="text-sm text-muted-foreground">
                    Présentez-vous pour commencer la discussion
                  </p>
                </div>
                
                <Input
                  placeholder="Votre nom *"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                />
                
                <Input
                  type="email"
                  placeholder="Votre email (optionnel)"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                />
                
                <Button onClick={handleStartChat} className="w-full">
                  Commencer la discussion
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>Envoyez votre premier message !</p>
                        <p className="text-xs mt-1">Notre équipe vous répondra rapidement.</p>
                      </div>
                    )}
                    
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.is_from_admin ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-lg",
                            msg.is_from_admin
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {msg.is_from_admin ? 'Support' : 'Vous'}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
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

                {/* Message Input */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      size="icon"
                      disabled={isLoading || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
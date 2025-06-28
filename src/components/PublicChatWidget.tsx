import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  timestamp: string;
  is_admin: boolean;
}

export const PublicChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [hasSetName, setHasSetName] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les messages du chat depuis localStorage
  useEffect(() => {
    if (isOpen) {
      const savedMessages = localStorage.getItem('publicChatMessages');
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
        }
      }
    }
  }, [isOpen]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem('publicChatMessages', JSON.stringify(newMessages));
    setMessages(newMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userName.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_name: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_admin: false
    };

    const updatedMessages = [...messages, message];
    saveMessages(updatedMessages);
    setNewMessage('');

    // Envoyer une notification réelle via Supabase
    try {
      // Obtenir les admins depuis les user_profiles
      const { data: adminProfiles, error: adminError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('role', 'super_admin');

      if (adminError) {
        console.error('Erreur lors de la récupération des admins:', adminError);
      } else if (adminProfiles && adminProfiles.length > 0) {
        // Envoyer une notification à chaque admin
        const notifications = adminProfiles.map(admin => ({
          user_id: admin.user_id,
          type: 'chat_message',
          title: 'Nouveau message chat public',
          message: `${userName}: ${newMessage.slice(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
          data: { 
            chat_message_id: message.id,
            user_name: userName,
            full_message: newMessage
          }
        }));

        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notifError) {
          console.error('Erreur notification Supabase:', notifError);
        } else {
          console.log('Notification envoyée aux admins via Supabase');
        }
      }

      // Fallback vers localStorage pour compatibilité
      const localNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      localNotifications.push({
        id: `notif-${Date.now()}`,
        type: 'chat',
        title: 'Nouveau message chat public',
        message: `${userName}: ${newMessage.slice(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('adminNotifications', JSON.stringify(localNotifications));
      
      toast.success('Message envoyé !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSetName && userName.trim()) {
      setHasSetName(true);
      toast.success(`Bienvenue ${userName} !`);
    } else if (hasSetName) {
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-lg">Chat Public</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          {!hasSetName ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Votre nom pour discuter :
                </label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Entrez votre nom..."
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!userName.trim()}>
                Commencer à discuter
              </Button>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    Aucun message pour le moment.
                    <br />
                    Commencez la conversation !
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-2 text-sm ${
                          msg.is_admin
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium text-xs">
                            {msg.is_admin ? 'Support' : msg.user_name}
                          </span>
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

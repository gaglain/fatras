import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, MessageSquare, Plus } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
}

interface Message {
  id: string;
  senderId: string;
  sender: string;
  message: string;
  time: string;
  isMe: boolean;
}

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');

  const [channels] = useState<Channel[]>([
    { id: 'general', name: 'Général', type: 'channel' },
    { id: 'booking', name: 'Booking', type: 'channel' },
    { id: 'production', name: 'Production', type: 'channel' },
    { id: 'tech', name: 'Technique', type: 'channel' },
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    general: [
      {
        id: '1',
        senderId: 'marie-martin',
        sender: 'Marie Martin',
        message: 'Salut ! As-tu les détails pour le contrat de demain ?',
        time: '14:30',
        isMe: false
      },
      {
        id: '2',
        senderId: 'me',
        sender: 'Moi',
        message: 'Oui, je viens de l\'envoyer par email.',
        time: '14:32',
        isMe: true
      }
    ],
    booking: [
      {
        id: '1',
        senderId: 'jean-dupont',
        sender: 'Jean Dupont',
        message: 'Nouveau contrat signé pour la tournée d\'été !',
        time: '15:15',
        isMe: false
      }
    ],
    production: [],
    tech: [
      {
        id: '1',
        senderId: 'sophie-tech',
        sender: 'Sophie Tech',
        message: 'Le matériel son est prêt pour ce soir',
        time: '16:00',
        isMe: false
      }
    ]
  });

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      sender: 'Moi',
      message: message.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedChannel]: [...(prev[selectedChannel] || []), newMessage]
    }));
    setMessage('');
  };

  const handleCreateChannel = () => {
    const channelName = prompt('Nom du nouveau canal :');
    if (channelName) {
      // Simplified channel creation
      console.log('Création du canal:', channelName);
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-80 border-r lg:border-b-0 border-b bg-card">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-semibold text-lg text-foreground">
              Messagerie Interne
            </h2>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCreateChannel}
              className="w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Canal</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium px-2 py-1 uppercase text-primary">
                Canaux
              </h3>
              {channels.filter(c => c.type === 'channel').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                    selectedChannel === channel.id 
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center">
            <Hash className="h-5 w-5 mr-2 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              {currentChannel?.name || 'Sélectionnez un canal'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                <p className="text-sm">Commencez une conversation dans #{currentChannel?.name}</p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border'
                    }`}
                  >
                    {!msg.isMe && (
                      <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs mt-1 opacity-70">{msg.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t bg-card">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder={`Message ${currentChannel ? '#' + currentChannel.name : ''}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
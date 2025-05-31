
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Hash, Users, MessageCircle, MoreVertical, Pin } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'poll' | 'file';
  pollOptions?: { option: string; votes: string[] }[];
  reactions?: { emoji: string; users: string[] }[];
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'event';
  description?: string;
  members: string[];
  eventId?: string;
  messages: Message[];
  isArchived?: boolean;
}

const sampleChannels: Channel[] = [
  {
    id: 'general',
    name: 'général',
    type: 'public',
    description: 'Canal général pour toute l\'équipe',
    members: ['user-1', 'user-2', 'user-3'],
    messages: [
      {
        id: '1',
        userId: 'user-1',
        content: 'Bonjour tout le monde ! 👋',
        timestamp: '2024-06-01T10:00:00Z',
        type: 'text',
        reactions: [{ emoji: '👋', users: ['user-2', 'user-3'] }]
      }
    ]
  },
  {
    id: 'festival-summer',
    name: 'Festival d\'Été 2024',
    type: 'event',
    description: 'Discussion pour le Festival d\'Été',
    members: ['user-1', 'user-2'],
    eventId: 'event-1',
    messages: []
  }
];

export const Messagerie: React.FC = () => {
  const { users, getUserById } = useUser();
  const [channels, setChannels] = useState<Channel[]>(sampleChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [messageText, setMessageText] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: 'user-1', // Current user
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, messages: [...channel.messages, newMessage] }
        : channel
    ));

    setMessageText('');
  };

  const createPoll = (question: string, options: string[]) => {
    const pollMessage: Message = {
      id: Date.now().toString(),
      userId: 'user-1',
      content: question,
      timestamp: new Date().toISOString(),
      type: 'poll',
      pollOptions: options.map(option => ({ option, votes: [] }))
    };

    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, messages: [...channel.messages, pollMessage] }
        : channel
    ));

    setShowPollCreator(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar - Channels */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Messagerie</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCreateChannel(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Canaux
            </div>
            {channels.filter(c => c.type === 'public').map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-gray-200 ${
                  selectedChannel.id === channel.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
              >
                <Hash className="h-4 w-4" />
                <span className="text-sm">{channel.name}</span>
              </button>
            ))}

            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider mt-4">
              Événements
            </div>
            {channels.filter(c => c.type === 'event').map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left px-2 py-1 rounded flex items-center space-x-2 hover:bg-gray-200 ${
                  selectedChannel.id === channel.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedChannel.type === 'public' ? (
                <Hash className="h-5 w-5 text-gray-500" />
              ) : (
                <MessageCircle className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{selectedChannel.name}</h3>
                {selectedChannel.description && (
                  <p className="text-sm text-gray-500">{selectedChannel.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {selectedChannel.members.length}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChannel.messages.map((message) => {
            const user = getUserById(message.userId);
            return (
              <div key={message.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{user?.name || 'Utilisateur'}</span>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                  
                  {message.type === 'text' && (
                    <p className="text-gray-700">{message.content}</p>
                  )}
                  
                  {message.type === 'poll' && (
                    <Card className="mt-2 max-w-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{message.content}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {message.pollOptions?.map((option, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-2 rounded border hover:bg-gray-50 flex justify-between"
                          >
                            <span>{option.option}</span>
                            <Badge variant="secondary">{option.votes.length}</Badge>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex space-x-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reaction.emoji} {reaction.users.length}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              placeholder={`Message #${selectedChannel.name}`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={() => setShowPollCreator(true)} variant="outline" size="sm">
              Sondage
            </Button>
            <Button onClick={sendMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Poll Creator Modal */}
      {showPollCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Créer un sondage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Question du sondage" />
              <Input placeholder="Option 1" />
              <Input placeholder="Option 2" />
              <Button variant="outline" size="sm" className="w-full">
                + Ajouter une option
              </Button>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowPollCreator(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => createPoll("Exemple de sondage", ["Option 1", "Option 2"])} className="flex-1">
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

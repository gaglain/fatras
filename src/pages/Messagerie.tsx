import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Send, Hash, Users, MessageCircle, MoreVertical, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { PollCreator } from '@/components/messaging/PollCreator';
import { UserMention } from '@/components/UserMention';
import { toast } from 'sonner';

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
    messages: []
  }
];

export const Messagerie: React.FC = () => {
  const { users, getUserById, currentUser } = useUser();
  const [channels, setChannels] = useState<Channel[]>(sampleChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [messageText, setMessageText] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private' | 'event'>('public');

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user-1',
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, messages: [...channel.messages, newMessage] }
        : channel
    ));

    setSelectedChannel(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setMessageText('');
    toast.success('Message envoyé');
  };

  const createChannel = () => {
    if (!newChannelName.trim()) {
      toast.error('Veuillez saisir un nom de canal');
      return;
    }

    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: newChannelName,
      type: newChannelType,
      description: newChannelDescription,
      members: [currentUser?.id || 'user-1'],
      messages: [],
      isArchived: false
    };

    setChannels(prev => [...prev, newChannel]);
    setSelectedChannel(newChannel);
    setShowCreateChannel(false);
    setNewChannelName('');
    setNewChannelDescription('');
    setNewChannelType('public');
    toast.success(`Canal "${newChannelName}" créé avec succès`);
  };

  const createPoll = (question: string, options: string[]) => {
    const pollMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user-1',
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

    setSelectedChannel(prev => ({
      ...prev,
      messages: [...prev.messages, pollMessage]
    }));

    setShowPollCreator(false);
    toast.success('Sondage créé avec succès');
  };

  const voteOnPoll = (messageId: string, optionIndex: number) => {
    const userId = currentUser?.id || 'user-1';
    
    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel.id 
        ? {
            ...channel,
            messages: channel.messages.map(msg => {
              if (msg.id === messageId && msg.pollOptions) {
                const newOptions = msg.pollOptions.map((option, index) => {
                  if (index === optionIndex) {
                    const hasVoted = option.votes.includes(userId);
                    return {
                      ...option,
                      votes: hasVoted 
                        ? option.votes.filter(id => id !== userId)
                        : [...option.votes, userId]
                    };
                  }
                  return {
                    ...option,
                    votes: option.votes.filter(id => id !== userId)
                  };
                });
                return { ...msg, pollOptions: newOptions };
              }
              return msg;
            })
          }
        : channel
    ));

    setSelectedChannel(prev => ({
      ...prev,
      messages: prev.messages.map(msg => {
        if (msg.id === messageId && msg.pollOptions) {
          const newOptions = msg.pollOptions.map((option, index) => {
            if (index === optionIndex) {
              const hasVoted = option.votes.includes(userId);
              return {
                ...option,
                votes: hasVoted 
                  ? option.votes.filter(id => id !== userId)
                  : [...option.votes, userId]
              };
            }
            return {
              ...option,
              votes: option.votes.filter(id => id !== userId)
            };
          });
          return { ...msg, pollOptions: newOptions };
        }
        return msg;
      })
    }));
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
            <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau canal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du canal</label>
                    <Input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="nom-du-canal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                    <Input
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="Description du canal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de canal</label>
                    <select 
                      value={newChannelType} 
                      onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private' | 'event')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="public">Public</option>
                      <option value="private">Privé</option>
                      <option value="event">Événement</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateChannel(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button onClick={createChannel} className="flex-1">
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          {selectedChannel.messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message dans ce canal</p>
              <p className="text-sm">Soyez le premier à écrire un message !</p>
            </div>
          ) : (
            selectedChannel.messages.map((message) => {
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
                          {message.pollOptions?.map((option, index) => {
                            const hasVoted = option.votes.includes(currentUser?.id || 'user-1');
                            const totalVotes = message.pollOptions?.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;
                            const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => voteOnPoll(message.id, index)}
                                className={`w-full text-left p-3 rounded border transition-colors ${
                                  hasVoted ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{option.option}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{percentage.toFixed(0)}%</span>
                                    <Badge variant="secondary">{option.votes.length}</Badge>
                                  </div>
                                </div>
                                {totalVotes > 0 && (
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                          <div className="text-xs text-gray-500 pt-2">
                            {message.pollOptions?.reduce((sum, opt) => sum + opt.votes.length, 0) || 0} vote(s) au total
                          </div>
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
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <UserMention
              value={messageText}
              onChange={setMessageText}
              placeholder={`Message #${selectedChannel.name}`}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none"
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
        <PollCreator
          onCreatePoll={createPoll}
          onClose={() => setShowPollCreator(false)}
        />
      )}
    </div>
  );
};

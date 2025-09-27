import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Users, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const PublicChatWidget: React.FC = () => {
  const { user } = useAuth();
  console.log('👤 PublicChatWidget - Current user:', user?.id);
  
  const {
    channels, 
    messages, 
    sendMessage, 
    createChannel, 
    createDirectMessage,
    availableUsers,
    fetchMessages,
    markChannelAsRead,
  } = useMessaging();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChannelCreator, setShowChannelCreator] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannel]);

  // Charger l'historique et marquer comme lu lors de la sélection
  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel);
      markChannelAsRead(activeChannel);
    }
  }, [activeChannel, fetchMessages, markChannelAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    try {
      await sendMessage(activeChannel, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Le nom du canal est requis');
      return;
    }

    try {
      const channelId = await createChannel(newChannelName, '', 'public', []);
      if (channelId) {
        setActiveChannel(channelId);
        setNewChannelName('');
        setShowChannelCreator(false);
        toast.success('Canal créé avec succès');
      }
    } catch (error) {
      console.error('Erreur création canal:', error);
      toast.error('Erreur lors de la création du canal');
    }
  };

  const handleCreateDM = async () => {
    if (!selectedUser) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      const channelId = await createDirectMessage(selectedUser);
      if (channelId) {
        setActiveChannel(channelId);
        setSelectedUser('');
        toast.success('Message privé créé');
      }
    } catch (error) {
      console.error('Erreur création DM:', error);
      toast.error('Erreur lors de la création du message privé');
    }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);
  const channelMessages = activeChannel ? messages[activeChannel] || [] : [];

  if (!user) return null;

  return (
    <>
      {/* Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-40 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChannelCreator(!showChannelCreator)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Channel Creation */}
            {showChannelCreator && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Input
                    placeholder="Nom du canal"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateChannel}>
                      Créer Canal
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChannelCreator(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Sélectionner un utilisateur pour DM</option>
                    {availableUsers.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.username || user.email}
                      </option>
                    ))}
                  </select>
                  {selectedUser && (
                    <Button
                      size="sm"
                      onClick={handleCreateDM}
                      className="mt-2 w-full"
                    >
                      Créer Message Privé
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Channel List */}
            <div className="border-b p-3">
              <ScrollArea className="max-h-20">
                <div className="flex flex-wrap gap-1">
                  {channels.map((channel) => (
                    <Badge
                      key={channel.id}
                      variant={activeChannel === channel.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveChannel(channel.id)}
                    >
                      {channel.type === 'direct' ? (
                        <Users className="h-3 w-3 mr-1" />
                      ) : null}
                      {channel.name.length > 15 
                        ? `${channel.name.substring(0, 15)}...` 
                        : channel.name}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              {activeChannelData ? (
                <div className="space-y-3">
                  {channelMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          message.user_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Sélectionnez un canal pour voir les messages
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            {activeChannelData && (
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
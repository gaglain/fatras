import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Users, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const PublicChatWidget: React.FC = () => {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const {
    channels, 
    messages, 
    sendMessage, 
    createChannel, 
    createDirectMessage,
    availableUsers,
    fetchMessages,
    fetchAvailableChannels,
    joinChannel,
    ensureMembership,
    markChannelAsRead,
  } = useMessaging();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChannelCreator, setShowChannelCreator] = useState(false);
  const [showChannelBrowser, setShowChannelBrowser] = useState(false);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id);
    }
  }, [channels, activeChannel]);

  // Charger l'historique et marquer comme lu lors de la sélection (avec auto-adhésion)
  useEffect(() => {
    if (activeChannel) {
      ensureMembership(activeChannel).finally(() => {
        fetchMessages(activeChannel);
        markChannelAsRead(activeChannel);
      });
    }
  }, [activeChannel, ensureMembership, fetchMessages, markChannelAsRead]);

  const activeChannelData = channels.find(c => c.id === activeChannel);
  const channelMessages = activeChannel ? messages[activeChannel] || [] : [];

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    const res = await sendMessage(activeChannel, newMessage.trim());
    if (!res) {
      toast.error("L'envoi du message a échoué. Vérifiez vos droits et réessayez.");
      return;
    }
    setNewMessage('');
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

  const loadAvailableChannels = async () => {
    try {
      const channels = await fetchAvailableChannels();
      setAvailableChannels(channels);
    } catch (error) {
      console.error('Error loading available channels:', error);
    }
  };

  const handleJoinChannel = async (channelId: string, channelName: string) => {
    const success = await joinChannel(channelId);
    if (success) {
      setActiveChannel(channelId);
      setShowChannelBrowser(false);
      toast.success(`Vous avez rejoint #${channelName}`);
      await loadAvailableChannels();
    } else {
      toast.error('Erreur lors de l\'adhésion au canal');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg"
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
            : "fixed bottom-24 right-6 w-96 h-[500px] z-40"
        )}>
          <CardHeader className={cn(isMobile ? "pb-2" : "pb-3")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                {isMobile ? "Masquer" : <X className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChannelCreator(!showChannelCreator)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowChannelBrowser(!showChannelBrowser);
                  if (!showChannelBrowser) loadAvailableChannels();
                }}
              >
                Parcourir
              </Button>
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
            
            {/* Channel Browser */}
            {showChannelBrowser && (
              <div className="space-y-2 p-3 bg-muted rounded-lg max-h-48 overflow-y-auto">
                <h4 className="font-medium text-sm">Canaux disponibles</h4>
                {availableChannels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun canal public disponible</p>
                ) : (
                  <div className="space-y-1">
                    {availableChannels.map((channel) => (
                      <div key={channel.id} className="flex items-center justify-between p-2 bg-background rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">#{channel.name}</span>
                            {channel.is_member && <span className="text-xs text-muted-foreground">(Membre)</span>}
                          </div>
                          {channel.description && (
                            <p className="text-xs text-muted-foreground">{channel.description}</p>
                          )}
                        </div>
                        {!channel.is_member && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJoinChannel(channel.id, channel.name)}
                          >
                            Rejoindre
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChannelBrowser(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
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
                  {channels.map((channel) => {
                    let displayName = channel.name;
                    if (channel.type === 'direct') {
                      const otherMember = channel.members?.find((m: any) => m.user_id !== user?.id);
                      if (otherMember?.user_profile) {
                        const { first_name, last_name, username } = otherMember.user_profile;
                        displayName = first_name && last_name ? `${first_name} ${last_name}` : username || 'Utilisateur';
                      }
                    }
                    
                    return (
                      <Badge
                        key={channel.id}
                        variant={activeChannel === channel.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setActiveChannel(channel.id)}
                      >
                        {channel.type === 'direct' ? (
                          <Users className="h-3 w-3 mr-1" />
                        ) : null}
                        {displayName.length > 15 
                          ? `${displayName.substring(0, 15)}...` 
                          : displayName}
                      </Badge>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              {activeChannelData ? (
                <div className="space-y-3">
                  {channelMessages.map((message) => {
                    const isMe = message.user_id === user?.id;
                    const displayName = message.user_profile?.first_name || 'Utilisateur';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                            isMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">{isMe ? 'Moi' : displayName}</p>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
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
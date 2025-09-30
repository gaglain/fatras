import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Hash, Users, Plus } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { toast } from 'sonner';

interface ChannelBrowserProps {
  trigger?: React.ReactNode;
  onChannelJoined?: (channelId: string) => void;
}

export const ChannelBrowser: React.FC<ChannelBrowserProps> = ({ 
  trigger, 
  onChannelJoined 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { fetchAvailableChannels, joinChannel } = useMessaging();

  const loadChannels = async () => {
    setLoading(true);
    try {
      const channels = await fetchAvailableChannels();
      setAvailableChannels(channels);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('Erreur lors du chargement des canaux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadChannels();
    }
  }, [isOpen]);

  const handleJoinChannel = async (channelId: string, channelName: string) => {
    const success = await joinChannel(channelId);
    if (success) {
      toast.success(`Vous avez rejoint #${channelName}`);
      onChannelJoined?.(channelId);
      await loadChannels(); // Refresh the list
    } else {
      toast.error('Erreur lors de l\'adhésion au canal');
    }
  };

  const filteredChannels = availableChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (channel.description && channel.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Parcourir les canaux
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Parcourir les canaux
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des canaux..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Channel List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement des canaux...
                </div>
              ) : filteredChannels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Aucun canal trouvé' : 'Aucun canal public disponible'}
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{channel.name}</span>
                        {channel.is_member && (
                          <Badge variant="secondary" className="text-xs">
                            Membre
                          </Badge>
                        )}
                      </div>
                      {channel.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {channel.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {channel.member_count} membre{channel.member_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    {!channel.is_member && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinChannel(channel.id, channel.name)}
                      >
                        Rejoindre
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
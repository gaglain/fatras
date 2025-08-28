import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Hash, Lock, MessageSquare, Trash2, Settings } from 'lucide-react';
import { Channel, useMessaging } from '@/hooks/useMessaging';

interface ChannelManagerProps {
  onChannelCreated?: (channelId: string) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({ onChannelCreated }) => {
  const { availableUsers, createChannel, createDirectMessage, deleteChannel } = useMessaging();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    selectedMembers: [] as string[]
  });

  const handleCreateChannel = async () => {
    if (!formData.name.trim()) return;

    const channelId = await createChannel(
      formData.name,
      formData.description,
      formData.type,
      formData.selectedMembers
    );

    if (channelId) {
      setShowCreateDialog(false);
      setFormData({ name: '', description: '', type: 'public', selectedMembers: [] });
      onChannelCreated?.(channelId);
    }
  };

  const handleCreateDM = async (userId: string) => {
    const channelId = await createDirectMessage(userId);
    if (channelId) {
      onChannelCreated?.(channelId);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    const success = await deleteChannel(channelToDelete.id);
    if (success) {
      setShowDeleteDialog(false);
      setChannelToDelete(null);
    }
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId]
    }));
  };

  return (
    <div className="space-y-2">
      {/* Create Channel */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start h-8">
            <Plus className="h-3 w-3 mr-2" />
            Créer un canal
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="channel-name">Nom du canal</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="channel-name"
                  placeholder="general, marketing, dev..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="channel-description">Description (optionnel)</Label>
              <Textarea
                id="channel-description"
                placeholder="De quoi parle ce canal ?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Type de canal</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'public' | 'private') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Public - Visible par tous
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Privé - Sur invitation seulement
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'private' && (
              <div>
                <Label>Inviter des membres</Label>
                <ScrollArea className="h-32 border rounded-md p-2 mt-1">
                  {availableUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={formData.selectedMembers.includes(user.user_id)}
                        onCheckedChange={() => toggleMember(user.user_id)}
                      />
                      <span className="text-sm">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username || user.email
                        }
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateChannel} disabled={!formData.name.trim()}>
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages directs uniquement */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Messages Directs</Label>
        <ScrollArea className="h-48">
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <Button
                key={user.user_id}
                variant="ghost"
                className="w-full justify-start p-2 h-auto mb-1"
                onClick={() => handleCreateDM(user.user_id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {(user.first_name?.[0] || user.username?.[0] || user.email[0]).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.username || user.email
                    }
                  </span>
                </div>
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground p-2">Aucun utilisateur disponible</p>
          )}
        </ScrollArea>
      </div>

      {/* Delete Channel Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer le canal <strong>#{channelToDelete?.name}</strong> ?
              Cette action est irréversible et tous les messages seront perdus.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteChannel}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
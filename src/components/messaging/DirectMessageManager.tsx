import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { UserAvatar } from './UserAvatar';
import { toast } from 'sonner';

interface DirectMessageManagerProps {
  trigger?: React.ReactNode;
  onChannelCreated?: (channelId: string) => void;
}

export const DirectMessageManager: React.FC<DirectMessageManagerProps> = ({ trigger, onChannelCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();
  const { availableUsers, createDirectMessage } = useMessaging();

  React.useEffect(() => {
    if (isOpen) {
      // Fetch les utilisateurs quand on ouvre le dialog
      // Les utilisateurs sont déjà gérés par useUserManagement
    }
  }, [isOpen]);

  const handleCreateDM = async () => {
    if (!selectedUserId) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Création DM avec utilisateur:', selectedUserId);
      const channelId = await createDirectMessage(selectedUserId);
      
      if (channelId) {
        toast.success('Conversation privée créée');
        onChannelCreated?.(channelId);
        setIsOpen(false);
        setSelectedUserId('');
      } else {
        toast.error('Erreur lors de la création de la conversation');
      }
    } catch (error) {
      console.error('❌ Erreur création DM:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const activeUsers = availableUsers.filter(u => u.is_active && u.user_id !== user?.id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Nouveau message privé
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nouveau message privé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un utilisateur
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un utilisateur..." />
              </SelectTrigger>
              <SelectContent>
                {activeUsers.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    Aucun utilisateur disponible
                  </SelectItem>
                 ) : (
                  activeUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <UserAvatar 
                        user={user} 
                        size="sm" 
                        showName={true} 
                        showStatus={true}
                      />
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedUserId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateDM}
              disabled={!selectedUserId || isLoading || activeUsers.length === 0}
            >
              {isLoading ? 'Création...' : 'Créer conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
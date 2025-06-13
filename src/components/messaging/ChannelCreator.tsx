
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Hash } from 'lucide-react';

interface ChannelCreatorProps {
  onCreateChannel: (name: string) => void;
}

export const ChannelCreator: React.FC<ChannelCreatorProps> = ({ onCreateChannel }) => {
  const [channelName, setChannelName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (channelName.trim()) {
      onCreateChannel(channelName.trim());
      setChannelName('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Nouveau topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            Créer un nouveau topic
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Nom du topic (ex: marketing, events...)"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!channelName.trim()}>
              Créer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

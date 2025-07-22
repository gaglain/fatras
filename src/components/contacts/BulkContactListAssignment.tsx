import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkContactListAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContactIds: string[];
  contactLists: any[];
  onListCreated?: () => void;
}

export const BulkContactListAssignment: React.FC<BulkContactListAssignmentProps> = ({
  isOpen,
  onClose,
  selectedContactIds,
  contactLists,
  onListCreated
}) => {
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAssignToList = async () => {
    if (selectedContactIds.length === 0) {
      toast.error('Aucun contact sélectionné');
      return;
    }

    if (!selectedListId && !newListName.trim()) {
      toast.error('Veuillez sélectionner une liste ou créer une nouvelle liste');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Utilisateur non connecté');
        return;
      }

      let listId = selectedListId;

      // Créer une nouvelle liste si nécessaire
      if (isCreatingNew && newListName.trim()) {
        const { data: newList, error: listError } = await supabase
          .from('contact_lists')
          .insert({
            name: newListName.trim(),
            user_id: user.id
          })
          .select()
          .single();

        if (listError || !newList) {
          throw new Error('Erreur lors de la création de la liste');
        }

        listId = newList.id;
      }

      if (!listId) {
        toast.error('Aucune liste sélectionnée');
        return;
      }

      // Ajouter les contacts à la liste
      const members = selectedContactIds.map(contactId => ({
        contact_list_id: listId,
        contact_id: contactId
      }));

      const { error: memberError } = await supabase
        .from('contact_list_members')
        .insert(members);

      if (memberError) {
        throw memberError;
      }

      toast.success(
        isCreatingNew 
          ? `Liste "${newListName}" créée avec ${selectedContactIds.length} contacts`
          : `${selectedContactIds.length} contacts ajoutés à la liste`
      );

      onListCreated?.();
      handleClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'assignation à la liste');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedListId('');
    setNewListName('');
    setIsCreatingNew(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ajouter à une liste</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {selectedContactIds.length} contact(s) sélectionné(s)
          </p>

          <div className="space-y-3">
            <Button
              variant={!isCreatingNew ? "default" : "outline"}
              onClick={() => setIsCreatingNew(false)}
              className="w-full justify-start"
            >
              Ajouter à une liste existante
            </Button>

            {!isCreatingNew && (
              <div>
                <Label>Liste existante</Label>
                <Select value={selectedListId} onValueChange={setSelectedListId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une liste" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactLists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant={isCreatingNew ? "default" : "outline"}
              onClick={() => setIsCreatingNew(true)}
              className="w-full justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une nouvelle liste
            </Button>

            {isCreatingNew && (
              <div>
                <Label>Nom de la nouvelle liste</Label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nom de la liste"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleAssignToList} 
              disabled={loading || (!selectedListId && !newListName.trim())}
              className="flex-1"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
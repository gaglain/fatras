import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactListAssignmentProps {
  contactId: string;
  contactName: string;
}

export const ContactListAssignment: React.FC<ContactListAssignmentProps> = ({
  contactId,
  contactName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [currentLists, setCurrentLists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadContactLists();
    }
  }, [isOpen]);

  const loadContactLists = async () => {
    try {
      // Charger toutes les listes
      const { data: lists, error: listsError } = await supabase
        .from('contact_lists')
        .select('*')
        .order('name');

      if (listsError) throw listsError;

      // Charger les listes actuelles du contact
      const { data: members, error: membersError } = await supabase
        .from('contact_list_members')
        .select('contact_list_id')
        .eq('contact_id', contactId);

      if (membersError) throw membersError;

      const currentListIds = members?.map(m => m.contact_list_id) || [];
      
      setContactLists(lists || []);
      setCurrentLists(currentListIds);
      setSelectedLists(currentListIds);
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error);
      toast.error('Impossible de charger les listes');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Trouver les listes à ajouter et à retirer
      const listsToAdd = selectedLists.filter(id => !currentLists.includes(id));
      const listsToRemove = currentLists.filter(id => !selectedLists.includes(id));

      // Retirer des listes
      if (listsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('contact_list_members')
          .delete()
          .eq('contact_id', contactId)
          .in('contact_list_id', listsToRemove);

        if (removeError) throw removeError;
      }

      // Ajouter aux listes
      if (listsToAdd.length > 0) {
        const members = listsToAdd.map(listId => ({
          contact_list_id: listId,
          contact_id: contactId
        }));

        const { error: addError } = await supabase
          .from('contact_list_members')
          .insert(members);

        if (addError) throw addError;
      }

      toast.success('Listes mises à jour avec succès');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour des listes');
    } finally {
      setLoading(false);
    }
  };

  const toggleList = (listId: string) => {
    if (selectedLists.includes(listId)) {
      setSelectedLists(selectedLists.filter(id => id !== listId));
    } else {
      setSelectedLists([...selectedLists, listId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Gérer les listes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter à des listes</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {contactName}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {contactLists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Aucune liste disponible</p>
              <p className="text-sm">Créez d'abord une liste de contacts</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {contactLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => toggleList(list.id)}
                >
                  <Checkbox
                    checked={selectedLists.includes(list.id)}
                    onCheckedChange={() => toggleList(list.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{list.name}</p>
                      {currentLists.includes(list.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Actuel
                        </Badge>
                      )}
                    </div>
                    {list.description && (
                      <p className="text-sm text-muted-foreground">{list.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || contactLists.length === 0}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

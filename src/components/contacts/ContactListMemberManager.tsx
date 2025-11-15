import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Mail, MailWarning } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';

interface ContactListMemberManagerProps {
  listId: string;
  listName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactListMemberManager: React.FC<ContactListMemberManagerProps> = ({
  listId,
  listName,
  open,
  onOpenChange
}) => {
  const { contacts, getContactsInList, updateContactList } = useContactLists();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open && listId) {
      loadCurrentMembers();
    }
  }, [open, listId]);

  const loadCurrentMembers = async () => {
    setLoading(true);
    try {
      const members = await getContactsInList(listId);
      const memberIds = members.map(m => m.id);
      setCurrentMembers(memberIds);
      setSelectedContacts(memberIds);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactList(listId, {
        contactIds: selectedContacts
      });
      toast.success('Liste mise à jour');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name} ${contact.email || ''} ${contact.company || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedContacts.length;
  const addedCount = selectedContacts.filter(id => !currentMembers.includes(id)).length;
  const removedCount = currentMembers.filter(id => !selectedContacts.includes(id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gérer les contacts - {listName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {selectedCount} contact{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            {(addedCount > 0 || removedCount > 0) && (
              <span className="ml-2">
                ({addedCount > 0 && `+${addedCount}`}
                {addedCount > 0 && removedCount > 0 && ', '}
                {removedCount > 0 && `-${removedCount}`})
              </span>
            )}
          </p>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 space-y-2 pr-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun contact trouvé
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const isSelected = selectedContacts.includes(contact.id);
                  const wasInList = currentMembers.includes(contact.id);
                  const isAdded = isSelected && !wasInList;
                  const isRemoved = !isSelected && wasInList;

                  return (
                    <div
                      key={contact.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'bg-accent/50 border-accent' : 'border-border hover:bg-accent/20'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleContact(contact.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </span>
                          {isAdded && (
                            <Badge variant="default" className="text-xs">Nouveau</Badge>
                          )}
                          {isRemoved && (
                            <Badge variant="destructive" className="text-xs">Retiré</Badge>
                          )}
                          {wasInList && !isRemoved && (
                            <Badge variant="secondary" className="text-xs">Actuel</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              {contact.accepts_marketing_emails ? (
                                <Mail className="h-3 w-3" />
                              ) : (
                                <MailWarning className="h-3 w-3 text-warning" />
                              )}
                              {contact.email}
                            </span>
                          )}
                          {contact.company && (
                            <span className="text-xs">• {contact.company}</span>
                          )}
                        </div>
                        {!contact.accepts_marketing_emails && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            N'accepte pas les emails marketing
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

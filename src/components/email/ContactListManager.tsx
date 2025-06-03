import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactIds: string[];
  createdAt: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptsPromotionalEmails: boolean;
}

interface ContactListManagerProps {
  contacts: Contact[];
  onListCreated?: (list: ContactList) => void;
}

export const ContactListManager: React.FC<ContactListManagerProps> = ({ 
  contacts, 
  onListCreated 
}) => {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.acceptsPromotionalEmails &&
    (`${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error('Veuillez saisir un nom pour la liste');
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error('Veuillez sélectionner au moins un contact');
      return;
    }

    const newList: ContactList = {
      id: `list-${Date.now()}`,
      name: newListName,
      description: newListDescription,
      contactIds: selectedContacts,
      createdAt: new Date().toISOString()
    };

    setLists(prev => [...prev, newList]);
    onListCreated?.(newList);
    
    toast.success(`Liste "${newListName}" créée avec ${selectedContacts.length} contacts`);
    
    // Reset form
    setNewListName('');
    setNewListDescription('');
    setSelectedContacts([]);
    setOpen(false);
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAll = () => {
    setSelectedContacts(filteredContacts.map(c => c.id));
  };

  const selectNone = () => {
    setSelectedContacts([]);
  };

  return (
    <div className="space-y-4">
      {/* Existing Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <Card key={list.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{list.name}</span>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {list.contactIds.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {list.description && (
                <p className="text-sm text-gray-600 mb-2">{list.description}</p>
              )}
              <p className="text-xs text-gray-500">
                Créée le {new Date(list.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New List */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Créer une nouvelle liste de contacts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une liste de contacts</DialogTitle>
            <DialogDescription>
              Sélectionnez les contacts à inclure dans votre liste de diffusion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listName">Nom de la liste *</Label>
                <Input
                  id="listName"
                  placeholder="Ex: Clients VIP, Prospects festival..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listDescription">Description (optionnel)</Label>
                <Input
                  id="listDescription"
                  placeholder="Brève description..."
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rechercher des contacts</Label>
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Tout sélectionner
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={selectNone}>
                  Tout désélectionner
                </Button>
              </div>
              <Badge variant="secondary">
                {selectedContacts.length} contact(s) sélectionné(s)
              </Badge>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    </div>
                    <Tag className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun contact trouvé</p>
                  <p className="text-sm">Seuls les contacts acceptant les emails promotionnels sont affichés</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateList}>
                Créer la liste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

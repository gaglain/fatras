import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Edit, Trash2, Search, Loader2, UserPlus, X } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { ContactListMemberManager } from '@/components/contacts/ContactListMemberManager';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

export const ContactLists: React.FC = () => {
  const {
    contactLists,
    contacts,
    loading,
    createContactList,
    updateContactList,
    deleteContactList
  } = useContactLists();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<SearchItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SearchItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedContacts: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      selectedContacts: []
    });
    setSelectedArtist(null);
    setSelectedEvent(null);
  };

  const handleCreateList = async () => {
    if (!formData.name.trim()) return;
    
    setCreating(true);
    try {
      await createContactList({
        name: formData.name,
        description: formData.description || undefined,
        artist_id: selectedArtist?.id,
        event_id: selectedEvent?.id,
        contactIds: formData.selectedContacts
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setCreating(false);
    }
  };

  const handleEditList = (list: any) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      selectedContacts: []
    });
    
    // Charger l'artiste et l'événement sélectionnés
    if (list.centralized_artists) {
      setSelectedArtist({
        id: list.centralized_artists.id,
        type: 'artist',
        title: list.centralized_artists.name,
        subtitle: '',
        data: list.centralized_artists
      });
    } else {
      setSelectedArtist(null);
    }
    
    if (list.events) {
      setSelectedEvent({
        id: list.events.id,
        type: 'event',
        title: list.events.title,
        subtitle: '',
        data: list.events
      });
    } else {
      setSelectedEvent(null);
    }
    
    setShowEditDialog(true);
  };

  const handleUpdateList = async () => {
    if (!selectedList || !formData.name.trim()) return;
    
    try {
      await updateContactList(selectedList.id, {
        name: formData.name,
        description: formData.description || undefined,
        artist_id: selectedArtist?.id || null,
        event_id: selectedEvent?.id || null
      });
      setShowEditDialog(false);
      setSelectedList(null);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      await deleteContactList(listId);
    }
  };

  const handleManageMembers = (list: any) => {
    setSelectedList(list);
    setShowMemberManager(true);
  };

  const filteredLists = contactLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Listes de Contacts</h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez vos listes pour les campagnes email
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvelle Liste</span>
              <span className="sm:hidden">Nouvelle</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle liste de contacts</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la liste</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Festivals été 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la liste"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lier à un artiste (optionnel)</label>
                  {selectedArtist ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="flex-1">
                        {selectedArtist.title}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArtist(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <UniversalSearch
                      filterTypes={['artist']}
                      placeholder="Rechercher un artiste..."
                      triggerText="Sélectionner un artiste"
                      onSelect={(item) => setSelectedArtist(item)}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lier à un spectacle (optionnel)</label>
                  {selectedEvent ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="flex-1">
                        {selectedEvent.title}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <UniversalSearch
                      filterTypes={['event']}
                      placeholder="Rechercher un spectacle..."
                      triggerText="Sélectionner un spectacle"
                      onSelect={(item) => setSelectedEvent(item)}
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Sélectionner les contacts ({contacts.length} disponibles)
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={formData.selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, selectedContacts: [...formData.selectedContacts, contact.id] });
                            } else {
                              setFormData({ ...formData, selectedContacts: formData.selectedContacts.filter(id => id !== contact.id) });
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                      {!contact.accepts_marketing_emails && (
                        <Badge variant="secondary" className="text-xs">
                          N'accepte pas les emails marketing
                        </Badge>
                      )}
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun contact disponible
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateList} disabled={creating || !formData.name.trim()}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer la liste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher des listes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredLists.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{list.name}</h3>
                    <Badge variant="outline">
                      {list.contactCount || 0} contacts
                    </Badge>
                  </div>
                  {list.description && (
                    <p className="text-muted-foreground mb-3">{list.description}</p>
                  )}
                  
                  {(list.centralized_artists || list.events) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {list.centralized_artists && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {list.centralized_artists.name}
                        </Badge>
                      )}
                      {list.events && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          📅 {list.events.title}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground mt-3">
                    Créée le {new Date(list.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleManageMembers(list)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditList(list)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteList(list.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLists.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune liste de contacts</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première liste de contacts pour vos campagnes email.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une liste
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier la liste de contacts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
            {/* Informations de la liste */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold">Informations</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la liste</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Festivals été 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la liste"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lier à un artiste (optionnel)</label>
                  {selectedArtist ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="flex-1">
                        {selectedArtist.title}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArtist(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <UniversalSearch
                      filterTypes={['artist']}
                      placeholder="Rechercher un artiste..."
                      triggerText="Sélectionner un artiste"
                      onSelect={(item) => setSelectedArtist(item)}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lier à un spectacle (optionnel)</label>
                  {selectedEvent ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                      <Badge variant="secondary" className="flex-1">
                        {selectedEvent.title}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <UniversalSearch
                      filterTypes={['event']}
                      placeholder="Rechercher un spectacle..."
                      triggerText="Sélectionner un spectacle"
                      onSelect={(item) => setSelectedEvent(item)}
                    />
                  )}
                </div>
                <Button 
                  onClick={handleUpdateList} 
                  disabled={!formData.name.trim()}
                  className="w-full"
                >
                  Sauvegarder les infos
                </Button>
              </div>
            </div>

            {/* Gestion des membres */}
            <div className="lg:col-span-2 overflow-y-auto">
              {selectedList && (
                <ContactListMemberManager
                  listId={selectedList.id}
                  listName={selectedList.name}
                  open={true}
                  onOpenChange={() => {}}
                  embedded={true}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedList && (
        <ContactListMemberManager
          listId={selectedList.id}
          listName={selectedList.name}
          open={showMemberManager}
          onOpenChange={setShowMemberManager}
        />
      )}
    </div>
  );
};
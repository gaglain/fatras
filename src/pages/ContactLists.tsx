import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, Edit, Trash2, Search, Loader2, UserPlus, X } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { ContactListMemberManager } from '@/components/contacts/ContactListMemberManager';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { SearchItem } from '@/components/UniversalSearch';
import { ContactListFormDialog } from './ContactListFormDialog';

export const ContactLists: React.FC = () => {
  const { contactLists, contacts, loading, createContactList, updateContactList, deleteContactList } = useContactLists();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<SearchItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SearchItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', selectedContacts: [] as string[] });

  const resetForm = () => { setFormData({ name: '', description: '', selectedContacts: [] }); setSelectedArtist(null); setSelectedEvent(null); };

  const handleCreateList = async () => {
    if (!formData.name.trim()) return;
    setCreating(true);
    try {
      await createContactList({ name: formData.name, description: formData.description || undefined, artist_id: selectedArtist?.id, event_id: selectedEvent?.id, contactIds: formData.selectedContacts });
      setShowCreateDialog(false); resetForm();
    } catch {} finally { setCreating(false); }
  };

  const handleEditList = (list: any) => {
    setSelectedList(list);
    setFormData({ name: list.name, description: list.description || '', selectedContacts: [] });
    setSelectedArtist(list.centralized_artists ? { id: list.centralized_artists.id, type: 'artist', title: list.centralized_artists.name, subtitle: '', data: list.centralized_artists } : null);
    setSelectedEvent(list.events ? { id: list.events.id, type: 'event', title: list.events.title, subtitle: '', data: list.events } : null);
    setShowEditDialog(true);
  };

  const handleUpdateList = async () => {
    if (!selectedList || !formData.name.trim()) return;
    try {
      await updateContactList(selectedList.id, { name: formData.name, description: formData.description || undefined, artist_id: selectedArtist?.id || null, event_id: selectedEvent?.id || null });
      setShowEditDialog(false); setSelectedList(null); resetForm();
    } catch {}
  };

  const confirmAction = useConfirm();
  const handleDeleteList = async (listId: string) => {
    const ok = await confirmAction({ title: 'Supprimer la liste', description: 'Êtes-vous sûr de vouloir supprimer cette liste ?', variant: 'destructive' });
    if (ok) await deleteContactList(listId);
  };

  const filteredLists = contactLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) || (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Listes de Contacts</h1><p className="text-muted-foreground mt-2">Créez et gérez vos listes pour les campagnes email</p></div>
        <Button className="w-full lg:w-auto" onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle Liste</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Rechercher des listes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-4 md:gap-6">
        {filteredLists.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                    <h3 className="text-base md:text-lg font-semibold truncate">{list.name}</h3>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{list.contactCount || 0} contacts</Badge>
                  </div>
                  <div className="flex gap-1 md:gap-2 flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setSelectedList(list); setShowMemberManager(true); }}><UserPlus className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditList(list)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteList(list.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
                {(list.centralized_artists || list.events) && (
                  <div className="flex flex-wrap gap-1.5">
                    {list.centralized_artists && <Badge variant="secondary" className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" />{list.centralized_artists.name}</Badge>}
                    {list.events && <Badge variant="secondary" className="flex items-center gap-1 text-xs">📅 {list.events.title}</Badge>}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">Créée le {new Date(list.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredLists.length === 0 && (
          <Card><CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune liste de contacts</h3>
            <p className="text-muted-foreground mb-4">Commencez par créer votre première liste.</p>
            <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Créer une liste</Button>
          </CardContent></Card>
        )}
      </div>

      <ContactListFormDialog
        open={showCreateDialog} onOpenChange={setShowCreateDialog} title="Créer une nouvelle liste de contacts"
        formData={formData} setFormData={setFormData}
        selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist}
        selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent}
        contacts={contacts} showContacts saving={creating} onSave={handleCreateList} saveLabel="Créer la liste"
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Modifier la liste de contacts</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold">Informations</h3>
                <div><label className="block text-sm font-medium mb-2">Nom</label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-2">Description</label><Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                <Button onClick={handleUpdateList} disabled={!formData.name.trim()} className="w-full">Sauvegarder les infos</Button>
              </div>
            </div>
            <div className="lg:col-span-2 overflow-y-auto">
              {selectedList && <ContactListMemberManager listId={selectedList.id} listName={selectedList.name} open={true} onOpenChange={() => {}} embedded />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedList && <ContactListMemberManager listId={selectedList.id} listName={selectedList.name} open={showMemberManager} onOpenChange={setShowMemberManager} />}
    </div>
  );
};

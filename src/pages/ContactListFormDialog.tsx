import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

interface ContactListFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  formData: { name: string; description: string; selectedContacts: string[] };
  setFormData: (data: any) => void;
  selectedArtist: SearchItem | null;
  setSelectedArtist: (v: SearchItem | null) => void;
  selectedEvent: SearchItem | null;
  setSelectedEvent: (v: SearchItem | null) => void;
  contacts: any[];
  showContacts?: boolean;
  saving: boolean;
  onSave: () => void;
  saveLabel: string;
}

export const ContactListFormDialog: React.FC<ContactListFormDialogProps> = ({
  open, onOpenChange, title, formData, setFormData, selectedArtist, setSelectedArtist,
  selectedEvent, setSelectedEvent, contacts, showContacts = false, saving, onSave, saveLabel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de la liste</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Festivals été 2024" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description de la liste" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lier à un artiste (optionnel)</label>
              {selectedArtist ? (
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                  <Badge variant="secondary" className="flex-1">{selectedArtist.title}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedArtist(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <UniversalSearch filterTypes={['artist']} placeholder="Rechercher un artiste..." triggerText="Sélectionner un artiste" onSelect={(item) => setSelectedArtist(item)} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lier à un spectacle (optionnel)</label>
              {selectedEvent ? (
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                  <Badge variant="secondary" className="flex-1">{selectedEvent.title}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <UniversalSearch filterTypes={['event']} placeholder="Rechercher un spectacle..." triggerText="Sélectionner un spectacle" onSelect={(item) => setSelectedEvent(item)} />
              )}
            </div>
          </div>

          {showContacts && (
            <div>
              <ContactPickerSection
                contacts={contacts}
                selectedIds={formData.selectedContacts}
                onChange={(ids) => setFormData({ ...formData, selectedContacts: ids })}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={onSave} disabled={saving || !formData.name.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{saveLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  formData: { name: string; description: string; selectedContacts: string[]; is_exclusion?: boolean };
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
      <DialogContent className="!flex !flex-col !overflow-hidden !p-0 !gap-0 !w-[100vw] !h-[100dvh] sm:!w-[95vw] sm:!max-w-2xl sm:!h-[90dvh] sm:!max-h-[90dvh]">
        <DialogHeader className="px-4 sm:px-6 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-6 pb-3 pr-16 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 flex-1 min-h-0 overscroll-contain">
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
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-destructive/5">
              <Checkbox
                id="is-exclusion"
                checked={!!formData.is_exclusion}
                onCheckedChange={(checked) => setFormData({ ...formData, is_exclusion: !!checked })}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="is-exclusion" className="text-sm font-medium cursor-pointer">
                  Liste d'exclusion (désinscription)
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Les contacts de cette liste ne recevront plus aucune campagne email, peu importe les autres listes auxquelles ils appartiennent.
                </p>
              </div>
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

        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-6 border-t shrink-0 bg-background shadow-[0_-8px_20px_hsl(var(--background)/0.92)]">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Annuler</Button>
          <Button onClick={onSave} disabled={saving || !formData.name.trim()} className="w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{saveLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ContactPickerSectionProps {
  contacts: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const ContactPickerSection: React.FC<ContactPickerSectionProps> = ({ contacts, selectedIds, onChange }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const hay = [
        c.first_name, c.last_name, c.email, c.phone,
        c.company, c.position, c.city, c.postal_code,
        ...(Array.isArray(c.tags) ? c.tags : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, query]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.includes(c.id));

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      const ids = new Set(filtered.map((c) => c.id));
      onChange(selectedIds.filter((id) => !ids.has(id)));
    } else {
      const set = new Set(selectedIds);
      filtered.forEach((c) => set.add(c.id));
      onChange(Array.from(set));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold leading-snug min-w-0">
          Contacts ({filtered.length}/{contacts.length}) — {selectedIds.length} sélectionné(s)
        </h3>
        {filtered.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={toggleAllFiltered} className="w-full sm:w-auto shrink-0">
            {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Button>
        )}
      </div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher : nom, email, ville, code postal (ex: 89), tag…"
          className="pl-9"
        />
      </div>
      <div className="space-y-2 max-h-[38dvh] sm:max-h-72 overflow-y-auto overflow-x-hidden border rounded-lg p-2 sm:p-4 overscroll-contain">
        {filtered.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between gap-2 p-2 border rounded min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Checkbox
                checked={selectedIds.includes(contact.id)}
                onCheckedChange={(checked) => {
                  onChange(checked
                    ? [...selectedIds, contact.id]
                    : selectedIds.filter((id) => id !== contact.id));
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{contact.first_name} {contact.last_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {contact.email}
                  {contact.postal_code || contact.city ? ` · ${[contact.postal_code, contact.city].filter(Boolean).join(' ')}` : ''}
                </p>
              </div>
            </div>
            {!contact.accepts_marketing_emails && (
              <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">No marketing</Badge>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            {contacts.length === 0 ? 'Aucun contact disponible' : 'Aucun contact ne correspond à la recherche'}
          </p>
        )}
      </div>
    </>
  );
};

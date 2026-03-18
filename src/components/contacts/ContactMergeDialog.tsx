import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Merge, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';

interface ContactMergeDialogProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onMergeComplete: () => void;
}

type MergeableField = keyof Pick<Contact,
  'first_name' | 'last_name' | 'email' | 'phone' | 'position' | 'company' |
  'address' | 'city' | 'postal_code' | 'country' | 'status' | 'source' | 'notes' | 'role'
>;

const FIELD_LABELS: Record<MergeableField, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  position: 'Poste',
  company: 'Entreprise',
  address: 'Adresse',
  city: 'Ville',
  postal_code: 'Code postal',
  country: 'Pays',
  status: 'Statut',
  source: 'Source',
  notes: 'Notes',
  role: 'Rôle',
};

const MERGE_FIELDS: MergeableField[] = Object.keys(FIELD_LABELS) as MergeableField[];

export const ContactMergeDialog: React.FC<ContactMergeDialogProps> = ({
  isOpen,
  contacts,
  onClose,
  onMergeComplete,
}) => {
  const [merging, setMerging] = useState(false);

  // Smart merge: pick the best non-empty value for each field.
  // Default to the most recently updated contact's value if both exist.
  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => {
      const da = a.updated_at || a.created_at || '';
      const db = b.updated_at || b.created_at || '';
      return db.localeCompare(da); // newest first
    }),
    [contacts]
  );

  // For each field, compute the smart default pick (index into sortedContacts)
  const smartDefaults = useMemo(() => {
    const defaults: Record<MergeableField, number> = {} as any;
    for (const field of MERGE_FIELDS) {
      // Find first contact (newest first) that has a non-empty value
      const idx = sortedContacts.findIndex(c => {
        const val = c[field];
        return val !== undefined && val !== null && val !== '';
      });
      defaults[field] = idx >= 0 ? idx : 0;
    }
    return defaults;
  }, [sortedContacts]);

  const [selections, setSelections] = useState<Record<MergeableField, number>>(smartDefaults);

  const setFieldSelection = (field: MergeableField, idx: number) => {
    setSelections(prev => ({ ...prev, [field]: idx }));
  };

  // Only show fields that differ between contacts
  const divergingFields = useMemo(() => {
    return MERGE_FIELDS.filter(field => {
      const values = new Set(sortedContacts.map(c => (c[field] || '').toString().trim().toLowerCase()));
      return values.size > 1;
    });
  }, [sortedContacts]);

  const handleMerge = async () => {
    if (sortedContacts.length < 2) return;
    setMerging(true);

    try {
      // The primary contact is the newest one (index 0)
      const primaryContact = sortedContacts[0];
      const secondaryIds = sortedContacts.slice(1).map(c => c.id!);

      // Build merged data from selections
      const mergedData: Partial<Contact> = {};
      for (const field of MERGE_FIELDS) {
        const sourceIdx = selections[field] ?? 0;
        mergedData[field] = sortedContacts[sourceIdx][field] as any;
      }

      // Merge tags: combine all tags
      const allTags = new Set<string>();
      for (const c of sortedContacts) {
        (c.tags || []).forEach(t => allTags.add(t));
      }
      (mergedData as any).tags = Array.from(allTags);

      // Update the primary contact
      const { error: updateError } = await supabase
        .from('contacts')
        .update(mergedData)
        .eq('id', primaryContact.id!);

      if (updateError) throw updateError;

      // Re-assign relationships from secondary contacts to primary
      // contact_events
      for (const secId of secondaryIds) {
        const { data: events } = await supabase
          .from('contact_events')
          .select('event_id')
          .eq('contact_id', secId);

        for (const ev of events || []) {
          await supabase
            .from('contact_events')
            .upsert({ contact_id: primaryContact.id!, event_id: ev.event_id }, { onConflict: 'contact_id,event_id', ignoreDuplicates: true });
        }
      }

      // contact_artists
      for (const secId of secondaryIds) {
        const { data: artists } = await supabase
          .from('contact_artists')
          .select('artist_id')
          .eq('contact_id', secId);

        for (const art of artists || []) {
          await supabase
            .from('contact_artists')
            .upsert({ contact_id: primaryContact.id!, artist_id: art.artist_id }, { onConflict: 'contact_id,artist_id', ignoreDuplicates: true });
        }
      }

      // contact_opportunities
      for (const secId of secondaryIds) {
        const { data: opps } = await supabase
          .from('contact_opportunities')
          .select('opportunity_id')
          .eq('contact_id', secId);

        for (const opp of opps || []) {
          await supabase
            .from('contact_opportunities')
            .upsert({ contact_id: primaryContact.id!, opportunity_id: opp.opportunity_id }, { onConflict: 'contact_id,opportunity_id', ignoreDuplicates: true });
        }
      }

      // contact_quotes
      for (const secId of secondaryIds) {
        const { data: quotes } = await supabase
          .from('contact_quotes')
          .select('quote_id')
          .eq('contact_id', secId);

        for (const q of quotes || []) {
          await supabase
            .from('contact_quotes')
            .upsert({ contact_id: primaryContact.id!, quote_id: q.quote_id }, { onConflict: 'contact_id,quote_id', ignoreDuplicates: true });
        }
      }

      // contact_list_members
      for (const secId of secondaryIds) {
        const { data: members } = await supabase
          .from('contact_list_members')
          .select('contact_list_id')
          .eq('contact_id', secId);

        for (const m of members || []) {
          await supabase
            .from('contact_list_members')
            .upsert(
              { contact_id: primaryContact.id!, contact_list_id: m.contact_list_id },
              { onConflict: 'contact_id,contact_list_id', ignoreDuplicates: true }
            );
        }
      }

      // emails: reassign to primary
      for (const secId of secondaryIds) {
        await supabase
          .from('emails')
          .update({ contact_id: primaryContact.id! })
          .eq('contact_id', secId);
      }

      // interactions: reassign to primary
      for (const secId of secondaryIds) {
        await supabase
          .from('interactions')
          .update({ contact_id: primaryContact.id! })
          .eq('contact_id', secId);
      }

      // Delete secondary contacts
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .in('id', secondaryIds);

      if (deleteError) throw deleteError;

      toast.success(`${sortedContacts.length} contacts fusionnés avec succès`);
      onMergeComplete();
    } catch (err: any) {
      console.error('Merge error:', err);
      toast.error('Erreur lors de la fusion des contacts');
    } finally {
      setMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Fusionner {sortedContacts.length} contacts
          </DialogTitle>
          <DialogDescription>
            Les champs non-vides du contact le plus complet sont pré-sélectionnés. Vous pouvez modifier chaque champ.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4">
            {/* Contact headers */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `140px repeat(${sortedContacts.length}, 1fr)` }}>
              <div className="text-sm font-medium text-muted-foreground">Champ</div>
              {sortedContacts.map((c, i) => (
                <div key={c.id} className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    {c.first_name} {c.last_name}
                    {i === 0 && <Badge variant="secondary" className="text-xs ml-1">Principal</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Modifié le {c.updated_at ? new Date(c.updated_at).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-merged fields (identical) */}
            {MERGE_FIELDS.filter(f => !divergingFields.includes(f)).length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                ✓ {MERGE_FIELDS.filter(f => !divergingFields.includes(f)).length} champ(s) identiques — fusionnés automatiquement
              </div>
            )}

            {/* Diverging fields — let user pick */}
            {divergingFields.map(field => (
              <div
                key={field}
                className="grid gap-2 items-start border-b border-border pb-3"
                style={{ gridTemplateColumns: `140px repeat(${sortedContacts.length}, 1fr)` }}
              >
                <Label className="text-sm pt-1">{FIELD_LABELS[field]}</Label>
                <RadioGroup
                  className="contents"
                  value={String(selections[field] ?? 0)}
                  onValueChange={(val) => setFieldSelection(field, Number(val))}
                >
                  {sortedContacts.map((c, i) => {
                    const value = (c[field] || '') as string;
                    return (
                      <label
                        key={c.id}
                        className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                          selections[field] === i ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value={String(i)} className="mt-0.5" />
                        <span className={`text-sm break-all ${!value ? 'text-muted-foreground italic' : ''}`}>
                          {value || '(vide)'}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>
            ))}

            {/* Tags merge info */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <strong>Tags :</strong> tous les tags seront combinés automatiquement.
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={merging}>
            Annuler
          </Button>
          <Button onClick={handleMerge} disabled={merging}>
            {merging ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
            Fusionner les contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

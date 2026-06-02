import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, MailWarning } from 'lucide-react';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';
import { ContactListFilters } from './ContactListFilters';

interface ContactListMemberManagerProps {
  listId: string;
  listName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
}

export const ContactListMemberManager: React.FC<ContactListMemberManagerProps> = ({
  listId, listName, open, onOpenChange, embedded = false
}) => {
  const { contacts, getContactsInList, updateContactList } = useContactLists();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMarketingConsent, setFilterMarketingConsent] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'city'>('name');

  useEffect(() => {
    if (open && listId) loadCurrentMembers();
  }, [open, listId]);

  const loadCurrentMembers = async () => {
    setLoading(true);
    try {
      const members = await getContactsInList(listId);
      const memberIds = members.map(m => m.id);
      setCurrentMembers(memberIds);
      setSelectedContacts(memberIds);
    } catch { toast.error('Erreur lors du chargement des membres'); }
    finally { setLoading(false); }
  };

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev => prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContactList(listId, { contactIds: selectedContacts });
      toast.success('Liste mise à jour');
      onOpenChange(false);
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const uniqueCities = useMemo(() => Array.from(new Set(contacts.map(c => c.city).filter((c): c is string => !!c))).sort(), [contacts]);
  const uniqueTags = useMemo(() => Array.from(new Set(contacts.flatMap(c => c.tags || []).filter((t): t is string => !!t))).sort(), [contacts]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const searchLower = searchTerm.toLowerCase();
      const searchableText = [contact.first_name, contact.last_name, contact.email, contact.phone, contact.company, contact.city, contact.position, contact.postal_code, ...(contact.tags || [])].filter(Boolean).join(' ').toLowerCase();
      return searchableText.includes(searchLower)
        && (filterCity === 'all' || contact.city === filterCity)
        && (!filterDepartment || (contact.postal_code && contact.postal_code.startsWith(filterDepartment)))
        && (filterStatus === 'all' || contact.status === filterStatus)
        && (filterMarketingConsent === 'all' || (filterMarketingConsent === 'yes' && contact.accepts_marketing_emails) || (filterMarketingConsent === 'no' && !contact.accepts_marketing_emails))
        && (filterTag === 'all' || (contact.tags && contact.tags.includes(filterTag)));
    });
    filtered.sort((a, b) => {
      const aS = selectedContacts.includes(a.id), bS = selectedContacts.includes(b.id);
      if (aS && !bS) return -1; if (!aS && bS) return 1;
      switch (sortBy) {
        case 'name': return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'email': return (a.email || '').localeCompare(b.email || '');
        case 'company': return (a.company || '').localeCompare(b.company || '');
        case 'city': return (a.city || '').localeCompare(b.city || '');
        default: return 0;
      }
    });
    return filtered;
  }, [contacts, searchTerm, filterCity, filterDepartment, filterStatus, filterMarketingConsent, filterTag, sortBy, selectedContacts]);

  const clearFilters = () => { setSearchTerm(''); setFilterCity('all'); setFilterDepartment(''); setFilterStatus('all'); setFilterMarketingConsent('all'); setFilterTag('all'); };
  const hasActiveFilters = !!(searchTerm || filterCity !== 'all' || filterDepartment || filterStatus !== 'all' || filterMarketingConsent !== 'all' || filterTag !== 'all');

  const selectedCount = selectedContacts.length;
  const addedCount = selectedContacts.filter(id => !currentMembers.includes(id)).length;
  const removedCount = currentMembers.filter(id => !selectedContacts.includes(id)).length;

  const content = (
    <>
      {!embedded && (
        <DialogHeader>
          <DialogTitle>Gérer les contacts - {listName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {selectedCount} contact{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            {(addedCount > 0 || removedCount > 0) && <span className="ml-2">({addedCount > 0 && `+${addedCount}`}{addedCount > 0 && removedCount > 0 && ', '}{removedCount > 0 && `-${removedCount}`})</span>}
          </p>
        </DialogHeader>
      )}
      {embedded && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-semibold mb-1">Membres de la liste</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCount} contact{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            {(addedCount > 0 || removedCount > 0) && <span className="ml-2 text-primary font-medium">({addedCount > 0 && `+${addedCount}`}{addedCount > 0 && removedCount > 0 && ', '}{removedCount > 0 && `-${removedCount}`})</span>}
          </p>
        </div>
      )}

      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        <ContactListFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          showFilters={showFilters} setShowFilters={setShowFilters}
          filterCity={filterCity} setFilterCity={setFilterCity}
          filterDepartment={filterDepartment} setFilterDepartment={setFilterDepartment}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterMarketingConsent={filterMarketingConsent} setFilterMarketingConsent={setFilterMarketingConsent}
          filterTag={filterTag} setFilterTag={setFilterTag}
          sortBy={sortBy} setSortBy={setSortBy}
          uniqueCities={uniqueCities} uniqueTags={uniqueTags}
          hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
          onSelectAll={() => setSelectedContacts(filteredContacts.map(c => c.id))}
          onDeselectAll={() => setSelectedContacts([])}
          onInvertSelection={() => { const ids = filteredContacts.map(c => c.id); setSelectedContacts(ids.filter(id => !selectedContacts.includes(id))); }}
        />

        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="overflow-y-auto flex-1 min-h-0 max-h-[50vh] lg:max-h-none space-y-2 pr-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucun contact trouvé</div>
            ) : filteredContacts.map(contact => {
              const isSelected = selectedContacts.includes(contact.id);
              const wasInList = currentMembers.includes(contact.id);
              const isAdded = isSelected && !wasInList;
              const isRemoved = !isSelected && wasInList;
              return (
                <div key={contact.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-accent/50 border-accent' : 'border-border hover:bg-accent/20'}`}>
                  <Checkbox checked={isSelected} onCheckedChange={() => handleToggleContact(contact.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{contact.first_name} {contact.last_name}</span>
                      {isAdded && <Badge variant="default" className="text-xs">Nouveau</Badge>}
                      {isRemoved && <Badge variant="destructive" className="text-xs">Retiré</Badge>}
                      {wasInList && !isRemoved && <Badge variant="secondary" className="text-xs">Actuel</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                      {contact.email && <span className="flex items-center gap-1">{contact.accepts_marketing_emails ? <Mail className="h-3 w-3" /> : <MailWarning className="h-3 w-3 text-warning" />}{contact.email}</span>}
                      {contact.company && <span className="text-xs">• {contact.company}</span>}
                    </div>
                    {!contact.accepts_marketing_emails && <Badge variant="outline" className="mt-1 text-xs">N'accepte pas les emails marketing</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="flex-1">Annuler</Button>
        <Button onClick={handleSave} disabled={saving || loading} className="flex-1">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
        </Button>
      </div>
    </>
  );

  if (embedded) return <div className="space-y-4 flex flex-col h-full min-h-0">{content}</div>;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">{content}</DialogContent>
    </Dialog>
  );
};

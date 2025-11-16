import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Mail, MailWarning, Filter, X, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';

interface ContactListMemberManagerProps {
  listId: string;
  listName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
}

export const ContactListMemberManager: React.FC<ContactListMemberManagerProps> = ({
  listId,
  listName,
  open,
  onOpenChange,
  embedded = false
}) => {
  const { contacts, getContactsInList, updateContactList } = useContactLists();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres
  const [filterCity, setFilterCity] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMarketingConsent, setFilterMarketingConsent] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'city'>('name');

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

  // Extraire les valeurs uniques pour les filtres
  const uniqueCities = useMemo(() => {
    const cities = contacts
      .map(c => c.city)
      .filter((city): city is string => !!city);
    return Array.from(new Set(cities)).sort();
  }, [contacts]);

  const uniqueTags = useMemo(() => {
    const allTags = contacts
      .flatMap(c => c.tags || [])
      .filter((tag): tag is string => !!tag);
    return Array.from(new Set(allTags)).sort();
  }, [contacts]);

  // Recherche et filtrage intelligents
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      // Recherche intelligente dans plusieurs champs
      const searchLower = searchTerm.toLowerCase();
      const searchableText = [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.company,
        contact.city,
        contact.position,
        contact.postal_code,
        ...(contact.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = searchableText.includes(searchLower);

      // Filtre par ville
      const matchesCity = filterCity === 'all' || contact.city === filterCity;

      // Filtre par département (2 premiers chiffres du code postal)
      const matchesDepartment = !filterDepartment || 
        (contact.postal_code && contact.postal_code.startsWith(filterDepartment));

      // Filtre par statut
      const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;

      // Filtre par consentement marketing
      const matchesMarketing = filterMarketingConsent === 'all' || 
        (filterMarketingConsent === 'yes' && contact.accepts_marketing_emails) ||
        (filterMarketingConsent === 'no' && !contact.accepts_marketing_emails);

      // Filtre par tag
      const matchesTag = filterTag === 'all' || 
        (contact.tags && contact.tags.includes(filterTag));

      return matchesSearch && matchesCity && matchesDepartment && 
             matchesStatus && matchesMarketing && matchesTag;
    });

    // Tri: sélectionnés en premier, puis par critère choisi
    filtered.sort((a, b) => {
      const aSelected = selectedContacts.includes(a.id);
      const bSelected = selectedContacts.includes(b.id);
      
      // Les sélectionnés en premier
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Si même statut de sélection, trier par critère
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'city':
          return (a.city || '').localeCompare(b.city || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [contacts, searchTerm, filterCity, filterDepartment, filterStatus, filterMarketingConsent, filterTag, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCity('all');
    setFilterDepartment('');
    setFilterStatus('all');
    setFilterMarketingConsent('all');
    setFilterTag('all');
  };

  const hasActiveFilters = searchTerm || filterCity !== 'all' || filterDepartment || 
                          filterStatus !== 'all' || filterMarketingConsent !== 'all' || 
                          filterTag !== 'all';

  const handleSelectAll = () => {
    setSelectedContacts(filteredContacts.map(c => c.id));
  };

  const handleDeselectAll = () => {
    setSelectedContacts([]);
  };

  const handleInvertSelection = () => {
    const filteredIds = filteredContacts.map(c => c.id);
    setSelectedContacts(prev => {
      const newSelection = filteredIds.filter(id => !prev.includes(id));
      return newSelection;
    });
  };

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
            {(addedCount > 0 || removedCount > 0) && (
              <span className="ml-2">
                ({addedCount > 0 && `+${addedCount}`}
                {addedCount > 0 && removedCount > 0 && ', '}
                {removedCount > 0 && `-${removedCount}`})
              </span>
            )}
          </p>
        </DialogHeader>
      )}

      {embedded && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-semibold mb-1">Membres de la liste</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCount} contact{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            {(addedCount > 0 || removedCount > 0) && (
              <span className="ml-2 text-primary font-medium">
                ({addedCount > 0 && `+${addedCount}`}
                {addedCount > 0 && removedCount > 0 && ', '}
                {removedCount > 0 && `-${removedCount}`})
              </span>
            )}
          </p>
        </div>
      )}

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Barre de recherche et actions */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher (nom, email, ville, tag, téléphone...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                Tout sélectionner
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeselectAll}
              >
                Tout désélectionner
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleInvertSelection}
              >
                Inverser
              </Button>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer les filtres
                </Button>
              )}
            </div>

            {/* Filtres avancés */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-3 pt-3 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Ville</Label>
                    <Select value={filterCity} onValueChange={setFilterCity}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {uniqueCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Département</Label>
                    <Input
                      placeholder="Ex: 75, 35..."
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="h-9"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Statut</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Marketing</Label>
                    <Select value={filterMarketingConsent} onValueChange={setFilterMarketingConsent}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="yes">Accepte</SelectItem>
                        <SelectItem value="no">N'accepte pas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Tag</Label>
                    <Select value={filterTag} onValueChange={setFilterTag}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {uniqueTags.map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Trier par</Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="company">Entreprise</SelectItem>
                        <SelectItem value="city">Ville</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
    </>
  );

  if (embedded) {
    return <div className="space-y-4 flex flex-col h-full">{content}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        {content}
      </DialogContent>
    </Dialog>
  );
};

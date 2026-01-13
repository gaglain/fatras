import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Filter, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFiltersManagerProps {
  contacts: any[];
  onCreateList: (listName: string, contactIds: string[]) => void;
}

interface FilterCriteria {
  postalCodeStartsWith: string;
  contactType: string;
  city: string;
  source: string;
}

export const ContactFiltersManager: React.FC<ContactFiltersManagerProps> = ({
  contacts,
  onCreateList
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    postalCodeStartsWith: '',
    contactType: 'all',
    city: 'all',
    source: 'all'
  });

  const applyFilters = () => {
    return contacts.filter(contact => {
      if (filters.postalCodeStartsWith && 
          (!contact.postal_code || !contact.postal_code.startsWith(filters.postalCodeStartsWith))) {
        return false;
      }
      
      if (filters.contactType && filters.contactType !== 'all' && contact.status !== filters.contactType) {
        return false;
      }
      
      if (filters.city && filters.city !== 'all' && 
          (!contact.city || contact.city !== filters.city)) {
        return false;
      }
      
      if (filters.source && filters.source !== 'all' && 
          (!contact.source || contact.source !== filters.source)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredContacts = applyFilters();

  const handleCreateList = async () => {
    if (!listName.trim()) {
      toast.error('Veuillez entrer un nom pour la liste');
      return;
    }

    if (filteredContacts.length === 0) {
      toast.error('Aucun contact ne correspond aux critères');
      return;
    }

    try {
      const contactIds = filteredContacts.map(contact => contact.id);
      await onCreateList(listName.trim(), contactIds);
      
      toast.success(`Liste "${listName}" créée avec ${filteredContacts.length} contacts`);
      
      // Reset form
      setListName('');
      setFilters({
        postalCodeStartsWith: '',
        contactType: 'all',
        city: 'all',
        source: 'all'
      });
      setIsOpen(false);
    } catch {
      toast.error('Erreur lors de la création de la liste');
    }
  };

  const resetFilters = () => {
    setFilters({
      postalCodeStartsWith: '',
      contactType: 'all',
      city: 'all',
      source: 'all'
    });
  };

  // Obtenir les valeurs uniques pour les select
  const uniqueStatuses = [...new Set(contacts.map(c => c.status).filter(Boolean))];
  const uniqueCities = [...new Set(contacts.map(c => c.city).filter(Boolean))];
  const uniqueSources = [...new Set(contacts.map(c => c.source).filter(Boolean))];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Créer liste avec filtres</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Créer une liste de contacts avec filtres</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nom de la liste */}
          <div className="space-y-2">
            <Label htmlFor="listName">Nom de la liste</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Clients Paris 75..."
            />
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Critères de filtrage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal commence par</Label>
                  <Input
                    id="postalCode"
                    value={filters.postalCodeStartsWith}
                    onChange={(e) => setFilters(prev => ({ ...prev, postalCodeStartsWith: e.target.value }))}
                    placeholder="Ex: 75, 69, 13..."
                  />
                </div>

                <div>
                  <Label htmlFor="contactType">Type de contact</Label>
                  <Select 
                    value={filters.contactType} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, contactType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status === 'prospect' ? 'Prospect' : 
                           status === 'client' ? 'Client' : 
                           status === 'inactive' ? 'Inactif' : status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">Ville contient</Label>
                  <Select 
                    value={filters.city} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {uniqueCities.slice(0, 20).map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select 
                    value={filters.source} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sources</SelectItem>
                      {uniqueSources.slice(0, 20).map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser filtres
                </Button>
                <div className="text-sm text-muted-foreground">
                  {filteredContacts.length} contact(s) correspondant(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu des contacts filtrés */}
          {filteredContacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu des contacts ({filteredContacts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredContacts.slice(0, 10).map(contact => (
                    <div key={contact.id} className="text-sm p-2 bg-muted/30 rounded">
                      {contact.first_name} {contact.last_name} - {contact.city || 'Ville inconnue'} ({contact.postal_code || 'CP inconnu'})
                    </div>
                  ))}
                  {filteredContacts.length > 10 && (
                    <div className="text-xs text-muted-foreground">
                      ... et {filteredContacts.length - 10} contacts supplémentaires
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateList}
              disabled={!listName.trim() || filteredContacts.length === 0}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Créer la liste</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
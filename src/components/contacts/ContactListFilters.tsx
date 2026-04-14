
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface ContactListFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  filterCity: string;
  setFilterCity: (v: string) => void;
  filterDepartment: string;
  setFilterDepartment: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterMarketingConsent: string;
  setFilterMarketingConsent: (v: string) => void;
  filterTag: string;
  setFilterTag: (v: string) => void;
  sortBy: string;
  setSortBy: (v: any) => void;
  uniqueCities: string[];
  uniqueTags: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
}

export const ContactListFilters: React.FC<ContactListFiltersProps> = (props) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher (nom, email, ville, tag, téléphone...)" value={props.searchTerm} onChange={(e) => props.setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button variant={props.showFilters ? "secondary" : "outline"} size="icon" onClick={() => props.setShowFilters(!props.showFilters)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={props.onSelectAll}>Tout sélectionner</Button>
        <Button variant="outline" size="sm" onClick={props.onDeselectAll}>Tout désélectionner</Button>
        <Button variant="outline" size="sm" onClick={props.onInvertSelection}>Inverser</Button>
        {props.hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={props.clearFilters}><X className="h-3 w-3 mr-1" />Effacer les filtres</Button>
        )}
      </div>

      <Collapsible open={props.showFilters} onOpenChange={props.setShowFilters}>
        <CollapsibleContent className="space-y-3 pt-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Ville</Label>
              <Select value={props.filterCity} onValueChange={props.setFilterCity}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {props.uniqueCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Département</Label>
              <Input placeholder="Ex: 75, 35..." value={props.filterDepartment} onChange={(e) => props.setFilterDepartment(e.target.value)} className="h-9" maxLength={2} />
            </div>
            <div>
              <Label className="text-xs">Statut</Label>
              <Select value={props.filterStatus} onValueChange={props.setFilterStatus}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
              <Select value={props.filterMarketingConsent} onValueChange={props.setFilterMarketingConsent}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Accepte</SelectItem>
                  <SelectItem value="no">N'accepte pas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tag</Label>
              <Select value={props.filterTag} onValueChange={props.setFilterTag}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {props.uniqueTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Trier par</Label>
              <Select value={props.sortBy} onValueChange={props.setSortBy}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
  );
};

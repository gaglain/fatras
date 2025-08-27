import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

interface SimpleContactFiltersProps {
  filters: {
    status: string;
    role: string;
    company: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const SimpleContactFilters: React.FC<SimpleContactFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ status: 'all', role: 'all', company: '' });
  };

  const hasActiveFilters = filters.status || filters.role || filters.company;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {hasActiveFilters && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              !
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtres</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>

          <div>
            <Label>Statut</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="partenaire">Partenaire</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Type de contact</Label>
            <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="artiste">Artiste</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="venue">Salle/Venue</SelectItem>
                <SelectItem value="organisateur">Organisateur</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="contact">Contact général</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Entreprise</Label>
            <Input
              placeholder="Filtrer par entreprise..."
              value={filters.company}
              onChange={(e) => updateFilter('company', e.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
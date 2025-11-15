
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Calendar, MapPin, User, Tag, Hash, CalendarDays } from 'lucide-react';

interface ContactFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  tagFilters: string[];
  onTagFiltersChange: (tags: string[]) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  cityFilter: string;
  onCityFilterChange: (city: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (department: string) => void;
  eventFilter: string;
  onEventFilterChange: (event: string) => void;
  availableTags: string[];
  availableSources: string[];
  availableCities: string[];
  availableEvents: Array<{ id: string; title: string }>;
  totalContacts: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tagFilters,
  onTagFiltersChange,
  sourceFilter,
  onSourceFilterChange,
  cityFilter,
  onCityFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  eventFilter,
  onEventFilterChange,
  availableTags,
  availableSources,
  availableCities,
  availableEvents,
  totalContacts,
  filteredCount,
  onClearFilters
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (tagFilters.includes(tag)) {
      onTagFiltersChange(tagFilters.filter(t => t !== tag));
    } else {
      onTagFiltersChange([...tagFilters, tag]);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || tagFilters.length > 0 || 
                          sourceFilter !== 'all' || cityFilter !== 'all' || 
                          departmentFilter !== '' || eventFilter !== 'all';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Barre de recherche principale */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, email, poste ou ville..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={showAdvancedFilters ? 'bg-blue-50 text-blue-600' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {(statusFilter !== 'all' ? 1 : 0) + tagFilters.length + 
                 (sourceFilter !== 'all' ? 1 : 0) + (cityFilter !== 'all' ? 1 : 0) +
                 (departmentFilter !== '' ? 1 : 0) + (eventFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Compteur de résultats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredCount} contact{filteredCount !== 1 ? 's' : ''} 
            {filteredCount !== totalContacts && ` sur ${totalContacts}`}
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-3 w-3 mr-1" />
              Effacer les filtres
            </Button>
          )}
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Filtre par statut */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-1" />
                Statut
              </label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par source */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Source
              </label>
              <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  {availableSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par ville */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Ville
              </label>
              <Select value={cityFilter} onValueChange={onCityFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Tags
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {tagFilters.length === 0 ? (
                      "Sélectionner des tags"
                    ) : (
                      `${tagFilters.length} tag${tagFilters.length !== 1 ? 's' : ''} sélectionné${tagFilters.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {availableTags.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Aucun tag disponible
                      </p>
                    ) : (
                      availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={tagFilters.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                          />
                          <label 
                            htmlFor={`tag-${tag}`}
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {tag}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtre par département (2 premiers chiffres du code postal) */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Hash className="h-4 w-4 mr-1" />
                Département
              </label>
              <Input
                placeholder="Ex: 75, 13..."
                value={departmentFilter}
                onChange={(e) => onDepartmentFilterChange(e.target.value)}
                maxLength={2}
                className="w-full"
              />
            </div>

            {/* Filtre par événement */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                Spectacle lié
              </label>
              <Select value={eventFilter} onValueChange={onEventFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les spectacles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les spectacles</SelectItem>
                  {availableEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tags actifs */}
        {tagFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagFilters.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-2 py-1">
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

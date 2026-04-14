import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, List, Map, MapPin } from 'lucide-react';

interface EventType { id: string; name: string; color: string; }

interface EventsFiltersProps {
  activeTab: 'list' | 'map';
  onTabChange: (tab: 'list' | 'map') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  eventTypes: EventType[];
  isGeocoding: boolean;
  onGeocodeAll: () => void;
}

export const EventsFilters: React.FC<EventsFiltersProps> = ({
  activeTab, onTabChange, searchTerm, onSearchChange, statusFilter, onStatusChange,
  typeFilter, onTypeChange, viewMode, onViewModeChange, eventTypes, isGeocoding, onGeocodeAll
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
    <TabsList className="w-fit">
      <TabsTrigger value="list" className="flex items-center gap-2" onClick={() => onTabChange('list')}>
        <List className="h-4 w-4" />Liste
      </TabsTrigger>
      <TabsTrigger value="map" className="flex items-center gap-2" onClick={() => onTabChange('map')}>
        <Map className="h-4 w-4" />Carte
      </TabsTrigger>
    </TabsList>

    <div className="relative flex-1 max-w-full sm:max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input placeholder="Rechercher des événements..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
    </div>

    <Select value={statusFilter} onValueChange={onStatusChange}>
      <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les statuts</SelectItem>
        <SelectItem value="pending">En attente</SelectItem>
        <SelectItem value="option">Option</SelectItem>
        <SelectItem value="confirmed">Confirmé</SelectItem>
        <SelectItem value="cancelled">Annulé</SelectItem>
        <SelectItem value="completed">Terminé</SelectItem>
      </SelectContent>
    </Select>

    <Select value={typeFilter} onValueChange={onTypeChange}>
      <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Type" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les types</SelectItem>
        {eventTypes.map((type) => (
          <SelectItem key={type.id} value={type.name}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              {type.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {activeTab === 'list' && <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />}
    {activeTab === 'map' && (
      <Button variant="outline" size="sm" onClick={onGeocodeAll} disabled={isGeocoding} className="text-xs sm:text-sm">
        <MapPin className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">{isGeocoding ? 'Géolocalisation...' : 'Géolocaliser tout'}</span>
      </Button>
    )}
  </div>
);

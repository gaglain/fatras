
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown } from 'lucide-react';
import { Artist } from '@/types/roadshow.types';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterArtist: string;
  setFilterArtist: React.Dispatch<React.SetStateAction<string>>;
  filterUser: string;
  setFilterUser: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  artists: Artist[];
  users: { id: string; name: string; isActive?: boolean }[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  filterArtist, 
  setFilterArtist, 
  filterUser, 
  setFilterUser,
  sortBy,
  setSortBy,
  artists, 
  users 
}) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher par ville ou lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
        <Select value={filterArtist} onValueChange={setFilterArtist}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Spectacle">
              {filterArtist === 'all' ? 'Tous les spectacles' : artists.find(a => a.id === filterArtist)?.name || 'Spectacle'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les spectacles</SelectItem>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Créateur">
              {filterUser === 'all' ? 'Tous les créateurs' : users.find(u => u.id === filterUser)?.name || 'Créateur'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les créateurs</SelectItem>
            {users.filter(user => user.isActive).map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Date (plus ancien)</SelectItem>
            <SelectItem value="date-desc">Date (plus récent)</SelectItem>
            <SelectItem value="artist">Spectacle (A-Z)</SelectItem>
            <SelectItem value="city">Ville (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

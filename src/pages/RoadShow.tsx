import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useArtists } from '@/hooks/useArtists';

import { SearchBar } from '@/components/roadshow/SearchBar';
import { RoadShowForm } from '@/components/roadshow/RoadShowForm';
import { TourStopCard } from '@/components/roadshow/TourStopCard';
import { useRoadshowForm } from '@/hooks/useRoadshowForm';
import { useRoadshowStops } from '@/hooks/useRoadshowStops';
import { TourStop } from '@/types/roadshow.types';

export const RoadShow: React.FC = () => {
  const { users, getUserById, currentUser } = useUser();
  const { artists: artistsData } = useArtists();
  const { tourStops, loading, createStop, updateStop, deleteStop, convertFromTourStop } = useRoadshowStops();
  
  // Transformer les données des artistes pour correspondre au type roadshow
  const artists = artistsData.map(artist => ({
    id: artist.id,
    name: `${artist.first_name} ${artist.last_name}`,
    genre: artist.function_title || 'Artiste'
  }));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-asc');
  
  const {
    formData,
    setFormData,
    selectedStop,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    selectedTab,
    setSelectedTab,
    handleCreateStop,
    handleEditStop,
    handleUpdateStop,
    handleDeleteStop
  } = useRoadshowForm(currentUser?.id, { createStop, updateStop, deleteStop, convertFromTourStop });

  const filteredAndSortedStops = React.useMemo(() => {
    // Filtrage
    const filtered = tourStops.filter(stop => {
      const matchesSearch = stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArtist = filterArtist === 'all' || stop.artists.includes(filterArtist);
      const matchesUser = filterUser === 'all' || stop.createdBy === filterUser;
      
      return matchesSearch && matchesArtist && matchesUser;
    });

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        case 'date-desc':
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
        case 'artist': {
          const artistA = artists.find(art => a.artists.includes(art.id))?.name || '';
          const artistB = artists.find(art => b.artists.includes(art.id))?.name || '';
          return artistA.localeCompare(artistB);
        }
        case 'city':
          return a.city.localeCompare(b.city);
        default:
          return 0;
      }
    });

    return sorted;
  }, [tourStops, searchTerm, filterArtist, filterUser, sortBy, artists]);

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-0 pb-20 sm:pb-0">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Feuille de Route</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Gérez votre tournée et planifiez vos dates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle étape de tournée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <RoadShowForm
                formData={formData}
                setFormData={setFormData}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                users={users}
              />

              <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateStop}>
                  Créer l'étape
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterArtist={filterArtist}
        setFilterArtist={setFilterArtist}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        sortBy={sortBy}
        setSortBy={setSortBy}
        artists={artists}
        users={users}
      />

      {/* Liste des étapes */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Chargement des étapes...
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedStops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune étape de tournée trouvée.</p>
              <p className="text-sm">Créez votre première étape pour commencer !</p>
            </div>
          ) : (
            filteredAndSortedStops.map((stop) => (
              <TourStopCard
                key={stop.id}
                stop={stop}
                artists={artists}
                creator={getUserById(stop.createdBy)}
                onEdit={handleEditStop}
                onDelete={handleDeleteStop}
                getUserById={getUserById}
              />
            ))
          )}
        </div>
      )}

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'étape de tournée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
              <RoadShowForm
                formData={formData}
                setFormData={setFormData}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                users={users}
                roadshowStopId={selectedStop?.id}
              />

            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateStop}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadShow;

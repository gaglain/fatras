
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';

import { sampleArtists, sampleTourStops } from '@/data/sampleData';
import { SearchBar } from '@/components/roadshow/SearchBar';
import { RoadShowForm } from '@/components/roadshow/RoadShowForm';
import { TourStopCard } from '@/components/roadshow/TourStopCard';
import { useRoadshowForm } from '@/hooks/useRoadshowForm';
import { TourStop } from '@/types/roadshow.types';

export const RoadShow: React.FC = () => {
  const { users, getUserById, currentUser } = useUser();
  const [tourStops, setTourStops] = useState<TourStop[]>(sampleTourStops);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  
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
  } = useRoadshowForm(tourStops, setTourStops, currentUser?.id);

  const filteredStops = tourStops.filter(stop => {
    const matchesSearch = stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArtist = filterArtist === 'all' || stop.artists.includes(filterArtist);
    const matchesUser = filterUser === 'all' || stop.createdBy === filterUser;
    
    return matchesSearch && matchesArtist && matchesUser;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feuille de Route</h1>
          <p className="text-gray-600 mt-2">Gérez votre tournée et planifiez vos dates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Étape
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
        artists={sampleArtists}
        users={users}
      />

      {/* Liste des étapes */}
      <div className="grid gap-6">
        {filteredStops.map((stop) => (
          <TourStopCard
            key={stop.id}
            stop={stop}
            artists={sampleArtists}
            creator={getUserById(stop.createdBy)}
            onEdit={handleEditStop}
            onDelete={handleDeleteStop}
            getUserById={getUserById}
          />
        ))}
      </div>

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

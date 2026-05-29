import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Map, List, Settings, CalendarDays, Archive, RotateCcw, Calculator, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useArtists } from '@/hooks/useArtists';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { SearchBar } from '@/components/roadshow/SearchBar';
import { RoadShowForm } from '@/components/roadshow/RoadShowForm';
import { TourStopCard } from '@/components/roadshow/TourStopCard';
import { RoadshowRouteMap } from '@/components/roadshow/RoadshowRouteMap';
import { RoadshowTimeline } from '@/components/roadshow/RoadshowTimeline';
import { VehicleRatesSettings } from '@/components/roadshow/VehicleRatesSettings';
import { ArtistConfirmationPopup } from '@/components/roadshow/ArtistConfirmationPopup';
import { useRoadshowForm } from '@/hooks/useRoadshowForm';
import { useRoadshowStops } from '@/hooks/useRoadshowStops';
import { useRoadshowSettings } from '@/hooks/useRoadshowSettings';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { useRoadshowFinancialSummary } from '@/hooks/useRoadshowFinancialSummary';
import { RoadshowFinancialSummary } from '@/components/roadshow/RoadshowFinancialSummary';
import { TourStop } from '@/types/roadshow.types';

export const RoadShow: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, getUserById, currentUser } = useUser();
  const { artists: artistsData } = useArtists();
  const { tourStops, stops, loading, fetchStops, createStop, updateStop, archiveStop, restoreStop, fetchArchivedStops, convertFromTourStop } = useRoadshowStops();
  const { settings } = useRoadshowSettings();
  const { rates, getRateByName, getDefaultRate } = useVehicleRates();
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'map' | 'finances' | 'settings' | 'archives'>('list');
  const [archivedStops, setArchivedStops] = useState<TourStop[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);

  // Auto-open stop from query param (e.g., from notification click)
  useEffect(() => {
    const stopId = searchParams.get('stop');
    if (stopId && !loading && tourStops.length > 0) {
      const stop = tourStops.find(s => s.id === stopId);
      if (stop) {
        handleEditStop(stop);
        // Clear the query param
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, loading, tourStops]);
  
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
    handleArchiveStop
  } = useRoadshowForm(currentUser?.id, { createStop, updateStop, archiveStop, convertFromTourStop });

  // Enrichir les stops avec les données de coût de transport
  const stopsWithCosts = React.useMemo(() => {
    return tourStops.map(stop => {
      const rawStop = stops.find(s => s.id === stop.id);
      const vehicleType = rawStop?.vehicle_type;
      const distanceKm = rawStop?.distance_km;
      
      let travelCost: number | undefined;
      let co2Emission: number | undefined;
      if (vehicleType && distanceKm && rates.length > 0) {
        const rate = getRateByName(vehicleType) || getDefaultRate();
        if (rate) {
          travelCost = (distanceKm * rate.rate_per_km) + rate.fixed_cost;
          co2Emission = distanceKm * (rate.co2_per_km || 0.21);
        }
      }
      
      return {
        ...stop,
        vehicleType,
        distanceKm,
        travelCost,
        co2Emission
      };
    });
  }, [tourStops, stops, rates, getRateByName, getDefaultRate]);

  // Financial summary data
  const financialStopsData = React.useMemo(() => 
    stopsWithCosts.map(s => ({
      id: s.id,
      city: s.city,
      venue: s.venue,
      date: s.date,
      travelCost: s.travelCost,
    })),
    [stopsWithCosts]
  );
  const financialStopIds = React.useMemo(() => stopsWithCosts.map(s => s.id), [stopsWithCosts]);
  const { stopSummaries, globalSummary, loading: financialLoading } = useRoadshowFinancialSummary(financialStopIds, financialStopsData);

  const filteredAndSortedStops = React.useMemo(() => {
    // Filtrage
    const filtered = stopsWithCosts.filter(stop => {
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
  }, [stopsWithCosts, searchTerm, filterArtist, filterUser, sortBy, artists]);

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-0 pb-20 sm:pb-0">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Feuille de Route</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Gérez votre tournée et planifiez vos dates</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/roadshow/audit" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-2 border-foreground">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Audit des liens
            </Button>
          </Link>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle
              </Button>
            </DialogTrigger>
         <DialogContent className="sm:!max-w-3xl overflow-x-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
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

      {/* Onglets Liste / Carte */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)} className="w-full">
        <TabsList className="mb-4 w-full grid grid-cols-6">
          <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Liste</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Carte</span>
          </TabsTrigger>
          <TabsTrigger value="finances" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Finances</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="archives" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3" onClick={async () => {
            setLoadingArchives(true);
            const archived = await fetchArchivedStops();
            setArchivedStops(archived.map(s => ({
              id: s.id, city: s.city, venue: s.venue, address: s.address || '', date: s.event_date || '', time: s.event_time || '',
              checkInTime: s.check_in_time || '', departureTime: s.departure_time || '', capacity: s.capacity, ticketsAvailable: s.tickets_available,
              status: s.status, crew: s.crew, equipment: s.equipment, notes: s.notes || '', artists: s.artists, createdBy: s.user_id,
              accommodation: s.accommodation || '', accommodationAddress: s.accommodation_address || '', localContact: s.local_contact || '',
              localContactPhone: s.local_contact_phone || '',
              technicalContactName: (s as any).technical_contact_name || '', technicalContactEmail: (s as any).technical_contact_email || '', technicalContactPhone: (s as any).technical_contact_phone || '',
              transport: s.transport || '', artistLineup: s.artist_lineup, invitations: s.invitations || '',
              meetingPointTime: s.meeting_point_time, meetingPointLocation: s.meeting_point_location, departureToShowTime: s.departure_to_show_time,
              soundcheckTime: s.soundcheck_time, doorsTime: s.doors_time, showStartTime: s.show_start_time, showEndTime: s.show_end_time, curfewTime: s.curfew_time,
              mealTime: s.meal_time, mealLocation: s.meal_location,
              vehicleType: s.vehicle_type, distanceKm: s.distance_km,
            })));
            setLoadingArchives(false);
          }}>
            <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Archives</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
                    onDelete={handleArchiveStop}
                    getUserById={getUserById}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <RoadshowTimeline
            stops={filteredAndSortedStops}
            getUserById={getUserById}
            onStopClick={handleEditStop}
          />
        </TabsContent>

        <TabsContent value="map">
          <RoadshowRouteMap 
            stops={tourStops.map(stop => {
              // Merge with raw stop data to get lat/lng
              const rawStop = stops.find(s => s.id === stop.id);
              return {
                ...stop,
                latitude: rawStop?.latitude ?? undefined,
                longitude: rawStop?.longitude ?? undefined,
                vehicleType: rawStop?.vehicle_type ?? undefined
              };
            }) as any}
            height="600px"
            defaultDepartureAddress={settings.default_departure_address}
          />
        </TabsContent>

        <TabsContent value="finances">
          <RoadshowFinancialSummary
            stopSummaries={stopSummaries}
            globalSummary={globalSummary}
            loading={financialLoading}
          />
        </TabsContent>

        <TabsContent value="settings">
          <VehicleRatesSettings />
        </TabsContent>

        <TabsContent value="archives">
          {loadingArchives ? (
            <div className="text-center py-8 text-muted-foreground">Chargement des archives...</div>
          ) : archivedStops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Aucune étape archivée.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {archivedStops.map((stop) => (
                <div key={stop.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{stop.city}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-muted-foreground">{stop.venue}</span>
                      {stop.date && (
                        <span className="text-xs text-muted-foreground">
                          ({new Date(stop.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })})
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const success = await restoreStop(stop.id);
                      if (success) {
                        setArchivedStops(prev => prev.filter(s => s.id !== stop.id));
                        toast.success(`"${stop.city} — ${stop.venue}" restaurée`);
                      }
                    }}
                    className="ml-3 shrink-0"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restaurer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:!max-w-3xl overflow-x-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
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

      {/* Popup de confirmation de présence pour les artistes */}
      {currentUser && !loading && (
        <ArtistConfirmationPopup
          userId={currentUser.id}
          stops={tourStops}
          getUserById={getUserById}
          onConfirmed={fetchStops}
        />
      )}
    </div>
  );
};

export default RoadShow;

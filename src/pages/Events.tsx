import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, Clock, CheckCircle, XCircle, Upload, Map, List, MapPin } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { EventDialog } from '@/components/events/EventDialog';
import { EventsMap } from '@/components/events/EventsMap';
import { CSVEventImporter } from '@/components/events/CSVEventImporter';
import { CSVEventExporter } from '@/components/events/CSVEventExporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEventTypes } from '@/hooks/useEventTypes';
import { useGeocoding } from '@/hooks/useGeocoding';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';
import { logger } from '@/lib/logger';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const { eventTypes } = useEventTypes();
  const { batchGeocodeEvents, isGeocoding } = useGeocoding();
  
  // State declarations
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search and filters
  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }

    setFilteredEvents(filtered);
  };

  // Event handlers
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Événement supprimé avec succès');
    } catch (error: unknown) {
      logger.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  const handleDialogClose = () => {
    setEditingEvent(null);
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingEvent(null);
    }
  };

  const handleSaveEvent = async () => {
    handleDialogClose();
    await fetchEvents();
  };

  const handleImportComplete = () => {
    fetchEvents();
    setCsvImportOpen(false);
  };

  const handleGeocodeAll = async () => {
    // Get events without coordinates that have address info
    const eventsToGeocode = events
      .filter(e => e.id && (!e.latitude || !e.longitude) && (e.address || e.city))
      .map(e => ({ 
        id: e.id!, 
        address: e.address, 
        city: e.city, 
        venue: e.venue,
        postal_code: e.postal_code,
        country: e.country
      }));
    
    if (eventsToGeocode.length === 0) {
      toast.info('Tous les événements sont déjà géolocalisés');
      return;
    }
    
    await batchGeocodeEvents(eventsToGeocode);
    await fetchEvents(); // Refresh to show updated coordinates
  };

  const getEventStats = () => {
    const pending = filteredEvents.filter(e => e.status === 'pending').length;
    const option = filteredEvents.filter(e => e.status === 'option').length;
    const confirmed = filteredEvents.filter(e => e.status === 'confirmed').length;
    const completed = filteredEvents.filter(e => e.status === 'completed').length;
    const cancelled = filteredEvents.filter(e => e.status === 'cancelled').length;
    const geolocated = filteredEvents.filter(e => e.latitude && e.longitude).length;

    return { total: filteredEvents.length, pending, option, confirmed, completed, cancelled, geolocated };
  };

  // Effects
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, typeFilter]);

  // Release any residual scroll/inert locks after the dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      try {
        const unlock = () => {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
          document.body.style.pointerEvents = '';
          document.documentElement.style.pointerEvents = '';

          // Remove any lingering Radix overlays that might block clicks
          document
            .querySelectorAll('[data-radix-dialog-overlay]')
            .forEach((el) => el.parentElement?.removeChild(el));

          // Remove inert everywhere
          document
            .querySelectorAll('[inert]')
            .forEach((el) => el.removeAttribute('inert'));

          // Remove any aria-hidden flags left behind
          document
            .querySelectorAll('[aria-hidden]')
            .forEach((el) => el.removeAttribute('aria-hidden'));

          // Remove any custom scroll locks
          document
            .querySelectorAll('[data-scroll-locked]')
            .forEach((el) => el.removeAttribute('data-scroll-locked'));
        };

        // Run immediately and on next tick (in case unmount happens after a frame)
        unlock();
        setTimeout(unlock, 0);
      } catch {
        // Scroll lock cleanup silently ignored
      }
    }

    return () => {
      // Ensure cleanup on unmount as well
      try {
        document
          .querySelectorAll('[data-radix-dialog-overlay]')
          .forEach((el) => el.parentElement?.removeChild(el));
        document
          .querySelectorAll('[aria-hidden]')
          .forEach((el) => el.removeAttribute('aria-hidden'));
        document
          .querySelectorAll('[inert]')
          .forEach((el) => el.removeAttribute('inert'));
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.documentElement.style.pointerEvents = '';
      } catch {}
    };
  }, [dialogOpen]);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des événements...</div>;
  }

  const stats = getEventStats();

  return (
    <div className="space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Événements</h1>
          <p className="text-muted-foreground mt-2">
            Organisez et gérez tous vos événements
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CSVEventExporter events={filteredEvents} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCsvImportOpen(true)}
            className="text-xs sm:text-sm"
          >
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">En attente</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Option</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.option}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Confirmés</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Terminés</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Annulés</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs for List/Map view */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'map')} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Carte
            </TabsTrigger>
          </TabsList>

          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher des événements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="option">Option</SelectItem>
              <SelectItem value="confirmed">Confirmé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {activeTab === 'list' && (
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
          
          {activeTab === 'map' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGeocodeAll}
              disabled={isGeocoding}
              className="text-xs sm:text-sm"
            >
              <MapPin className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isGeocoding ? 'Géolocalisation...' : 'Géolocaliser tout'}
              </span>
            </Button>
          )}
        </div>

        <TabsContent value="list" className="mt-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {events.length === 0 ? 'Aucun événement' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {events.length === 0 
                  ? 'Commencez par créer votre premier événement'
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
              {events.length === 0 && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <EventsMap 
            events={filteredEvents.map(e => ({
              id: e.id || '',
              title: e.title,
              venue: e.venue,
              city: e.city,
              address: e.address,
              start_date: e.start_date,
              status: e.status,
              latitude: e.latitude,
              longitude: e.longitude,
            }))}
            height="600px"
          />
          
          {stats.geolocated < stats.total && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {stats.geolocated}/{stats.total} événements géolocalisés. 
              Cliquez sur "Géolocaliser tout" pour localiser les événements manquants.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        event={editingEvent}
        onSave={handleSaveEvent}
      />

      <CSVEventImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleImportComplete}
      />
    </div>
  );
};
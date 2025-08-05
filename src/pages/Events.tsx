import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Calendar, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { EventDialog } from '@/components/events/EventDialog';
import { CSVEventImporter } from '@/components/events/CSVEventImporter';
import { CSVEventExporter } from '@/components/events/CSVEventExporter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleImportComplete = (importedEvents: any[]) => {
    console.log('Import completed:', importedEvents.length, 'events');
    fetchEvents();
    setCsvImportOpen(false);
  };

  const getEventStats = () => {
    const total = events.length;
    const pending = events.filter(e => e.status === 'pending').length;
    const confirmed = events.filter(e => e.status === 'confirmed').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const cancelled = events.filter(e => e.status === 'cancelled').length;
    
    return { total, pending, confirmed, completed, cancelled };
  };

  const getUniqueEventTypes = () => {
    const types = events
      .map(e => e.event_type)
      .filter(Boolean)
      .filter((type, index, array) => array.indexOf(type) === index);
    return types;
  };

  const stats = getEventStats();
  const eventTypes = getUniqueEventTypes();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Événements</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Gérez vos concerts, festivals et événements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <CSVEventExporter events={filteredEvents} />
          <Button onClick={() => setCsvImportOpen(true)} variant="outline" className="button-responsive">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Importer</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="button-responsive">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvel événement</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Confirmés</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Terminés</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Annulés</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmés</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="cancelled">Annulés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type!}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        event={editingEvent}
        onSave={() => {
          fetchEvents();
          handleDialogClose();
        }}
      />

      <CSVEventImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleImportComplete}
      />
    </div>
  );
};

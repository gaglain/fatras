import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Settings, Clock, MapPin, Users, Edit, Trash2, User, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AgendaCSVImporter } from '@/components/agenda/AgendaCSVImporter';
import { AgendaCSVExporter } from '@/components/agenda/AgendaCSVExporter';
import { CalendarFilter } from '@/components/agenda/CalendarFilter';
import { GoogleCalendarDisplay } from '@/components/integrations/GoogleCalendarDisplay';
import { CalendarViewContainer } from '@/components/calendar/CalendarViewContainer';
import { EventCreationDialog } from '@/components/calendar/EventCreationDialog';
import { EventEditDialog } from '@/components/calendar/EventEditDialog';
import { useEvents } from '@/hooks/useEvents';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  attendees: number;
  type: 'concert' | 'meeting' | 'other';
  status: 'confirmed' | 'pending' | 'cancelled';
  userId: string;
  userName: string;
}

const EventForm = ({ onSave, onCancel, event }: { 
  onSave: (event: AgendaEvent) => void; 
  onCancel: () => void; 
  event?: AgendaEvent 
}) => {
  const { currentUser } = useUser();
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [endDate, setEndDate] = useState(event?.endDate || '');
  const [location, setLocation] = useState(event?.location || '');
  const [attendees, setAttendees] = useState(event?.attendees || 0);
  const [type, setType] = useState<'concert' | 'meeting' | 'other'>(event?.type || 'other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !startDate) {
      toast.error('Titre et date de début requis');
      return;
    }

    const newEvent: AgendaEvent = {
      id: event?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || startDate,
      location: location.trim(),
      attendees,
      type,
      status: 'confirmed',
      userId: currentUser?.id || '',
      userName: `${currentUser?.name || ''} ${currentUser?.lastName || ''}`.trim() || 'Utilisateur inconnu'
    };

    onSave(newEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"    
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de l'événement"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'concert' | 'meeting' | 'other')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="other">Autre</option>
            <option value="concert">Concert</option>
            <option value="meeting">Réunion</option>
          </select>
        </div>
        <div>
          <Label htmlFor="startDate">Date de début *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Adresse ou nom du lieu"
          />
        </div>
        <div>
          <Label htmlFor="attendees">Nombre de participants</Label>
          <Input
            id="attendees"
            type="number"
            value={attendees}
            onChange={(e) => setAttendees(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails de l'événement"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {event ? 'Modifier' : 'Créer'} l'événement
        </Button>
      </div>
    </form>
  );
};

export const Agenda: React.FC = () => {
  const { currentUser, users } = useUser();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showCreationDialog, setShowCreationDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState<string[]>(users.map(u => u.id));
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  
  useEffect(() => {
    loadCalendarEvents();
  }, [selectedCalendars]);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      let query = supabase.from('calendar_events').select('*').order('start_time', { ascending: true });
      
      if (selectedCalendars.length > 0) {
        query = query.in('calendar_id', selectedCalendars);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCalendarEvents(data || []);
    } catch {
      // Erreur silencieuse
    }
  };

  const loadArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name');
      
      if (error) throw error;
      setArtists(data || []);
    } catch {
      // Erreur silencieuse
    }
  };

  const getArtistName = (artistId?: string) => {
    if (!artistId) return null;
    const artist = artists.find(a => a.id === artistId);
    return artist?.name;
  };
  
  // Transformer les événements Supabase en événements de l'agenda
  const agendaEvents: AgendaEvent[] = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    startDate: event.start_date || '',
    endDate: event.end_date || '',
    location: event.venue || '',
    attendees: event.attendees_count || 0,
    type: 'other' as const,
    status: event.status as 'confirmed' | 'pending' | 'cancelled',
    userId: event.user_id,
    userName: users.find(u => u.id === event.user_id) ? `${users.find(u => u.id === event.user_id)!.name} ${users.find(u => u.id === event.user_id)!.lastName}`.trim() : 'Utilisateur inconnu'
  }));

  const handleSaveEvent = async (event: AgendaEvent) => {
    if (!currentUser) return;

    if (editingEvent) {
      // Modifier un événement existant
      await updateEvent(event.id, {
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        end_date: event.endDate,
        venue: event.location,
        attendees_count: event.attendees,
        status: event.status
      });
      toast.success('Événement modifié');
    } else {
      // Créer un nouvel événement
      await addEvent({
        user_id: currentUser.id,
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        end_date: event.endDate,
        venue: event.location,
        attendees_count: event.attendees,
        status: event.status
      });
      toast.success('Événement créé');
    }
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setEditingEventId(event.id);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Supprimer cet événement ?')) {
      await deleteEvent(eventId);
      toast.success('Événement supprimé');
    }
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setShowCreationDialog(true);
  };

  const handleEventCreated = () => {
    // Reload events after creation
    window.location.reload();
  };

  const handleImportComplete = (importedEvents: AgendaEvent[]) => {
    // TODO: Implémenter l'import CSV avec Supabase
    setCsvImportOpen(false);
  };

  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleCalendarFilter = (calendarId: string) => {
    setSelectedCalendars(prev => 
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'concert': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = agendaEvents.filter(event => 
    visibleUsers.includes(event.userId)
  );

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Agenda
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos événements, concerts et réunions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <AgendaCSVExporter events={filteredEvents} />
          <Button onClick={() => setCsvImportOpen(true)} variant="outline" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Importer CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/preferences?tab=calendar">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Configuration</span>
              <span className="sm:hidden">Config</span>
            </Link>
          </Button>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvel Événement</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6">
          <EventCreationDialog 
            open={showCreationDialog} 
            onOpenChange={setShowCreationDialog}
            onEventCreated={handleEventCreated}
          />
          {editingEventId && (
            <EventEditDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              eventId={editingEventId}
              onEventUpdated={handleEventCreated}
            />
          )}
          <CalendarViewContainer />
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          
          {/* Filtres par calendrier */}
          <CalendarFilter
            selectedCalendars={selectedCalendars}
            onCalendarToggle={toggleCalendarFilter}
          />

      {/* Sélecteur d'utilisateurs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Agendas des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                  visibleUsers.includes(user.id)
                    ? 'bg-white shadow-sm border-gray-200' 
                    : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
                onClick={() => toggleUserVisibility(user.id)}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{`${user.name} ${user.lastName}`.trim()}</span>
                <Switch
                  checked={visibleUsers.includes(user.id)}
                  onCheckedChange={() => toggleUserVisibility(user.id)}
                  className="ml-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <GoogleCalendarDisplay />

      {/* Liste des événements du calendrier */}
      {selectedCalendars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Événements des calendriers sélectionnés</CardTitle>
          </CardHeader>
          <CardContent>
            {calendarEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-600">Aucun événement dans les calendriers sélectionnés</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Grouper les événements par jour
                  const eventsByDay: { [key: string]: typeof calendarEvents } = {};
                  calendarEvents
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .forEach(event => {
                      const dateKey = new Date(event.start_time).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      if (!eventsByDay[dateKey]) {
                        eventsByDay[dateKey] = [];
                      }
                      eventsByDay[dateKey].push(event);
                    });

                  return Object.entries(eventsByDay).map(([dateKey, dayEvents]) => (
                    <div key={dateKey} className="space-y-3">
                      <h3 className="font-semibold text-lg text-primary capitalize sticky top-0 bg-background py-2 border-b">
                        {dateKey}
                      </h3>
                      {dayEvents.map((event) => {
                        const artistName = getArtistName(event.artist_id);
                        return (
                          <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow ml-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{event.title}</h4>
                                {artistName && (
                                  <p className="text-sm font-medium text-primary mt-1">Spectacle: {artistName}</p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(event.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {event.provider}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Liste des événements */}
      <Card>
        <CardHeader>
          <CardTitle>Événements à venir</CardTitle>
        </CardHeader>
        <CardContent>
          {showEventForm && (
            <div className="mb-6 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30">
              <h3 className="font-medium mb-4 text-blue-900">
                {editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
              </h3>
              <EventForm
                onSave={handleSaveEvent}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                event={editingEvent || undefined}
              />
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun événement planifié</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre premier événement</p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Grouper les événements par jour
                const eventsByDay: { [key: string]: typeof filteredEvents } = {};
                filteredEvents
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .forEach(event => {
                    const dateKey = new Date(event.startDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    if (!eventsByDay[dateKey]) {
                      eventsByDay[dateKey] = [];
                    }
                    eventsByDay[dateKey].push(event);
                  });

                return Object.entries(eventsByDay).map(([dateKey, dayEvents]) => (
                  <div key={dateKey} className="space-y-3">
                    <h3 className="font-semibold text-lg text-primary capitalize sticky top-0 bg-background py-2 border-b">
                      {dateKey}
                    </h3>
                    {dayEvents.map((event) => {
                      const eventUser = users.find(u => u.id === event.userId);
                      const correspondingSupabaseEvent = events.find(e => e.id === event.id);
                      const artistName = getArtistName(correspondingSupabaseEvent?.artist_id);
                      return (
                        <Card key={event.id} className="hover:shadow-md transition-shadow ml-4">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                                  <h3 className="text-lg font-semibold">{event.title}</h3>
                                  <Badge className={getEventTypeColor(event.type)}>
                                    {event.type === 'concert' ? 'Concert' : 
                                     event.type === 'meeting' ? 'Réunion' : 'Autre'}
                                  </Badge>
                                  <Badge className={getStatusColor(event.status)}>
                                    {event.status === 'confirmed' ? 'Confirmé' :
                                     event.status === 'pending' ? 'En attente' : 'Annulé'}
                                  </Badge>
                                </div>
                                
                                {artistName && (
                                  <p className="text-sm font-medium text-primary mb-2">Spectacle: {artistName}</p>
                                )}
                                
                                {event.description && (
                                  <p className="text-gray-600 mb-3">{event.description}</p>
                                )}
                                
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    {event.endDate && event.endDate !== event.startDate && (
                                      <span> → {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                  {event.attendees > 0 && (
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-1" />
                                      {event.attendees} participants
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {event.userName}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditEvent(event)}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* CSV Import Dialog */}
      <AgendaCSVImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};
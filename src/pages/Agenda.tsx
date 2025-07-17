import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Settings, Clock, MapPin, Users, Edit, Trash2, X, User, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AgendaCSVImporter } from '@/components/agenda/AgendaCSVImporter';
import { AgendaCSVExporter } from '@/components/agenda/AgendaCSVExporter';

interface Event {
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

interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  isVisible: boolean;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice Martin', email: 'alice@example.com', color: '#3B82F6', isVisible: true },
  { id: '2', name: 'Bob Dupont', email: 'bob@example.com', color: '#10B981', isVisible: true },
  { id: '3', name: 'Claire Durand', email: 'claire@example.com', color: '#F59E0B', isVisible: true },
  { id: '4', name: 'David Moreau', email: 'david@example.com', color: '#EF4444', isVisible: false },
];

const EventForm = ({ onSave, onCancel, event }: { 
  onSave: (event: Event) => void; 
  onCancel: () => void; 
  event?: Event 
}) => {
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

    const newEvent: Event = {
      id: event?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || startDate,
      location: location.trim(),
      attendees,
      type,
      status: 'confirmed',
      userId: '1', // Current user
      userName: 'Alice Martin'
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
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === event.id ? event : e));
      toast.success('Événement modifié');
    } else {
      setEvents([...events, event]);
      toast.success('Événement créé');
    }
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Événement supprimé');
    }
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleImportComplete = (importedEvents: Event[]) => {
    setEvents([...events, ...importedEvents]);
    setCsvImportOpen(false);
  };

  const toggleUserVisibility = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isVisible: !user.isVisible } : user
    ));
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

  const filteredEvents = events.filter(event => 
    users.find(user => user.id === event.userId)?.isVisible
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Agenda
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos événements, concerts et réunions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AgendaCSVExporter events={filteredEvents} />
          <Button onClick={() => setCsvImportOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button variant="outline" asChild>
            <Link to="/preferences?tab=calendar">
              <Settings className="h-4 w-4 mr-2" />
              Configuration Google
            </Link>
          </Button>
          <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Événement
          </Button>
        </div>
      </div>

      {/* Sélecteur d'utilisateurs à la Notion */}
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
                  user.isVisible 
                    ? 'bg-white shadow-sm border-gray-200' 
                    : 'bg-gray-50 border-gray-100 opacity-50'
                }`}
                onClick={() => toggleUserVisibility(user.id)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                <Switch
                  checked={user.isVisible}
                  onCheckedChange={() => toggleUserVisibility(user.id)}
                  className="ml-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-4">
              {filteredEvents
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((event) => {
                  const user = users.find(u => u.id === event.userId);
                  return (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {user && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: user.color }}
                                />
                              )}
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
                            
                            {event.description && (
                              <p className="text-gray-600 mb-3">{event.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(event.startDate).toLocaleString('fr-FR')}
                                {event.endDate && event.endDate !== event.startDate && (
                                  <span> → {new Date(event.endDate).toLocaleString('fr-FR')}</span>
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
          )}
        </CardContent>
      </Card>

      {/* CSV Import Dialog */}
      <AgendaCSVImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, MapPin, Clock, ExternalLink, CheckSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface Event {
  id: string;
  name: string;
  typeIds: string[];
  date: string;
  venue: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  url?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  artist?: string;
  artistId?: string;
  contactIds?: string[];
  relatedTasks?: Array<{
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    dueDate: string;
  }>;
}

const sampleEventTypes: EventType[] = [
  { id: '1', name: 'Festival', color: 'bg-purple-500', isActive: true },
  { id: '2', name: 'Concert', color: 'bg-blue-500', isActive: true },
  { id: '3', name: 'Événement d\'entreprise', color: 'bg-green-500', isActive: true },
  { id: '4', name: 'Événement privé', color: 'bg-orange-500', isActive: true },
  { id: '5', name: 'Mariage', color: 'bg-pink-500', isActive: true },
];

// Données nettoyées
const sampleEvents: Event[] = [];
const sampleContacts = [];

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [eventTypes, setEventTypes] = useState<EventType[]>(sampleEventTypes);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);

  const handleTypeSelection = (typeId: string) => {
    setSelectedTypeIds(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-2">Gérer les concerts, festivals et dates de tournée</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/event-types">
            <Button variant="outline">Gérer Types</Button>
          </Link>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Événement
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre premier événement</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer Événement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status === 'confirmed' ? 'Confirmé' : event.status === 'pending' ? 'En attente' : 'Annulé'}
                    </Badge>
                    {/* Multiple Event Type Badges */}
                    {getEventTypesByIds(event.typeIds, eventTypes).map((type) => (
                      <Badge key={type.id} className={`${type.color} text-white`}>
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium">{event.venue}</div>
                          <div className="text-sm">
                            {event.address.street}<br/>
                            {event.address.city}, {event.address.postalCode}<br/>
                            {event.address.country}
                          </div>
                          <a
                            href={getGoogleMapsUrl(event.address, event.venue)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir sur Google Maps
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {event.artist && (
                        <div className="flex items-center text-gray-600">
                          <Link 
                            to="/artists" 
                            className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{event.artist}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}

                      {/* Linked Contacts */}
                      {event.contactIds && event.contactIds.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Contacts liés:</span>
                          </div>
                          <div className="space-y-1">
                            {getContactsByIds(event.contactIds).map((contact) => (
                              <Link
                                key={contact.id}
                                to="/contacts"
                                className="block text-purple-600 hover:text-purple-800 text-sm flex items-center space-x-1"
                              >
                                <span>{contact.name}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related Tasks */}
                  {event.relatedTasks && event.relatedTasks.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Tâches liées:</span>
                      </div>
                      <div className="space-y-1">
                        {event.relatedTasks.map((task) => (
                          <Link
                            key={task.id}
                            to="/tasks"
                            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700">{task.title}</span>
                              <Badge className={`${getTaskStatusColor(task.status)} text-xs`}>
                                {task.status === 'todo' ? 'À faire' : task.status === 'in-progress' ? 'En cours' : 'Terminé'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {event.url && (
                    <div className="mt-3">
                      <a 
                        href={event.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Site de l'événement
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Modifier</Button>
                  <Button variant="outline" size="sm">Voir Détails</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Ajouter Nouvel Événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom de l'événement" />
                <Input type="date" placeholder="Date de l'événement" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Types d'événement *</label>
                <div className="grid grid-cols-2 gap-2">
                  {eventTypes.filter(type => type.isActive).map((type) => (
                    <label key={type.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedTypeIds.includes(type.id)}
                        onChange={() => handleTypeSelection(type.id)}
                        className="rounded"
                      />
                      <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                      <span className="text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Input placeholder="Lieu/Salle" />
              <div className="space-y-2">
                <h4 className="font-medium">Adresse complète</h4>
                <Input placeholder="Rue et numéro" />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Ville" />
                  <Input placeholder="Code postal" />
                  <Input placeholder="Pays" />
                </div>
              </div>
              <Input placeholder="URL de l'événement (optionnel)" />
              <Input placeholder="Artiste" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={() => setShowAddForm(false)} 
                  disabled={selectedTypeIds.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Sauvegarder Événement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'todo':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getGoogleMapsUrl = (address: Event['address'], venue: string) => {
  const fullAddress = `${venue}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
};

const getContactsByIds = (contactIds?: string[]) => {
  if (!contactIds) return [];
  return sampleContacts.filter(contact => contactIds.includes(contact.id));
};

const getEventTypesByIds = (typeIds: string[], eventTypesArray: EventType[]) => {
  return eventTypesArray.filter(type => typeIds.includes(type.id));
};

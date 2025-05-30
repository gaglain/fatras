
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Clock, ExternalLink, CheckSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  type: string;
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

const sampleEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Festival de Musique d\'Été 2024',
    type: 'Festival',
    date: '2024-07-15',
    venue: 'Central Park',
    address: {
      street: '1 Central Park West',
      city: 'New York',
      postalCode: '10023',
      country: 'États-Unis'
    },
    url: 'https://summerfest2024.com',
    status: 'confirmed',
    artist: 'The Midnight Express',
    artistId: 'artist-1',
    contactIds: ['contact-1', 'contact-2'],
    relatedTasks: [
      { id: '1', title: 'Envoyer contrat au Madison Square Garden', status: 'todo', dueDate: '2024-06-15' }
    ]
  },
  {
    id: 'event-2',
    name: 'Soirée Acoustique',
    type: 'Concert',
    date: '2024-06-20',
    venue: 'Blue Note Jazz Club',
    address: {
      street: '131 W 3rd St',
      city: 'New York',
      postalCode: '10012',
      country: 'États-Unis'
    },
    status: 'pending',
    artist: 'Sarah Mitchell',
    artistId: 'artist-2',
    contactIds: ['contact-2'],
    relatedTasks: [
      { id: '2', title: 'Appeler la salle pour les exigences sonores', status: 'in-progress', dueDate: '2024-06-12' }
    ]
  }
];

// Sample contacts for linking
const sampleContacts = [
  { id: 'contact-1', name: 'John Smith - MSG', email: 'john.smith@venue.com' },
  { id: 'contact-2', name: 'Sarah Williams', email: 'sarah@festivalprods.com' },
  { id: 'contact-3', name: 'Mike Producer', email: 'mike.r@soundtech.com' }
];

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

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [showAddForm, setShowAddForm] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-2">Gérer les concerts, festivals et dates de tournée</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Événement
        </Button>
      </div>

      {/* Events List */}
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
                    <Badge variant="outline">{event.type}</Badge>
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

      {/* Add Event Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Ajouter Nouvel Événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom de l'événement" />
                <Input placeholder="Type (Concert, Festival, Tournée)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Date de l'événement" />
                <Input placeholder="Lieu/Salle" />
              </div>
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
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
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


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Search, MapPin, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  address?: string;
  city?: string;
  attendeesCount?: number;
  budgetMin?: number;
  budgetMax?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  eventType?: string;
  contactName?: string;
  requirements?: string;
  notes?: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('🎪 Events - Page loaded with', events.length, 'events');

  // Simulation de données
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Concert Jazz Festival',
        description: 'Concert de jazz en plein air',
        startDate: '2024-07-15T20:00:00',
        endDate: '2024-07-15T23:00:00',
        venue: 'Parc de la Musique',
        address: '123 Avenue des Arts',
        city: 'Paris',
        attendeesCount: 500,
        budgetMin: 5000,
        budgetMax: 8000,
        status: 'confirmed',
        eventType: 'Concert',
        contactName: 'Jean Dupont',
        requirements: 'Scène couverte, éclairage professionnel',
        notes: 'Prévoir plan B en cas de pluie'
      },
      {
        id: '2',
        title: 'Mariage Sarah & Pierre',
        description: 'Cérémonie et réception de mariage',
        startDate: '2024-08-20T16:00:00',
        endDate: '2024-08-21T02:00:00',
        venue: 'Château de Versailles',
        address: 'Place d\'Armes',
        city: 'Versailles',
        attendeesCount: 120,
        budgetMin: 15000,
        budgetMax: 20000,
        status: 'pending',
        eventType: 'Mariage',
        contactName: 'Marie Martin',
        requirements: 'DJ, éclairage romantique, sonorisation',
        notes: 'Thème champêtre chic'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    console.log('➕ Creating new event');
    setShowCreateForm(true);
    toast.info('Formulaire de création d\'événement (à implémenter)');
  };

  const handleEditEvent = (eventId: string) => {
    console.log('✏️ Editing event:', eventId);
    toast.info('Édition d\'événement (à implémenter)');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      console.log('🗑️ Deleting event:', eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Événement supprimé');
    }
  };

  const handleFileUploaded = (file: { url: string; name: string; type: string }) => {
    console.log('📎 File uploaded for events:', file);
    toast.success(`Document "${file.name}" ajouté à l'événement`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-purple-600" />
            Gestion des Événements
          </h1>
          <p className="mt-2 text-gray-600">
            {events.length} événement{events.length !== 1 ? 's' : ''} planifié{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Événement
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par titre, lieu ou contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload de documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents d'Événements</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload
            onFileUploaded={handleFileUploaded}
            acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            label="Télécharger des documents (contrats, plans, photos...)"
            maxSize={10}
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="grid gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditEvent(event.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div>Début: {formatDate(event.startDate)}</div>
                    <div>Fin: {formatDate(event.endDate)}</div>
                  </div>
                </div>
                
                {event.venue && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div>{event.venue}</div>
                      <div className="text-gray-500">{event.city}</div>
                    </div>
                  </div>
                )}

                {event.attendeesCount && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{event.attendeesCount} participants</span>
                  </div>
                )}
              </div>

              {(event.budgetMin || event.budgetMax) && (
                <div className="mb-4">
                  <span className="text-sm font-medium">Budget: </span>
                  <span className="text-sm">
                    {event.budgetMin && event.budgetMax 
                      ? `${event.budgetMin}€ - ${event.budgetMax}€`
                      : event.budgetMin 
                        ? `À partir de ${event.budgetMin}€`
                        : `Jusqu'à ${event.budgetMax}€`
                    }
                  </span>
                </div>
              )}

              {event.requirements && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Exigences:</strong> {event.requirements}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucun événement ne correspond à votre recherche.' : 'Commencez par planifier votre premier événement.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

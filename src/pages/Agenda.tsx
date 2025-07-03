
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Settings, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
}

export const Agenda: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    // Vérifier si Google Calendar est déjà connecté
    const savedConnection = localStorage.getItem('googleCalendarConnected');
    if (savedConnection === 'true') {
      setIsConnected(true);
      loadGoogleEvents();
    }
  }, []);

  const loadGoogleEvents = async () => {
    if (!isConnected) return;
    
    setIsLoadingEvents(true);
    try {
      // Simulation de chargement des événements Google Calendar
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Événements simulés pour la démo
      const mockEvents: GoogleEvent[] = [
        {
          id: '1',
          summary: 'Concert Jazz Festival',
          start: { dateTime: '2024-07-10T20:00:00Z' },
          end: { dateTime: '2024-07-10T23:00:00Z' },
          location: 'Salle Pleyel, Paris',
          description: 'Concert de jazz avec quartet exceptionnel'
        },
        {
          id: '2',
          summary: 'Répétition générale',
          start: { dateTime: '2024-07-08T14:00:00Z' },
          end: { dateTime: '2024-07-08T18:00:00Z' },
          location: 'Studio B, 15ème arrondissement'
        },
        {
          id: '3',
          summary: 'Meeting avec producteur',
          start: { dateTime: '2024-07-12T10:30:00Z' },
          end: { dateTime: '2024-07-12T11:30:00Z' },
          location: 'Bureau Musicorp'
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      // Simulation de la connexion OAuth Google Calendar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem('googleCalendarConnected', 'true');
      setIsConnected(true);
      toast.success('Connexion à Google Calendar réussie !');
      
      // Charger les événements après connexion
      loadGoogleEvents();
    } catch (error) {
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    localStorage.removeItem('googleCalendarConnected');
    setIsConnected(false);
    setEvents([]);
    toast.success('Déconnexion de Google Calendar réussie');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Agenda
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Gérez vos événements et synchronisez avec Google Calendar
          </p>
        </div>
        <div className="flex space-x-2">
          {isConnected ? (
            <Button 
              onClick={handleDisconnectGoogleCalendar}
              variant="outline"
              style={{
                borderColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-bg, #1632f4)'
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Déconnecter Google Calendar
            </Button>
          ) : (
            <Button 
              onClick={handleConnectGoogleCalendar}
              disabled={isConnecting}
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connexion...' : 'Connecter Google Calendar'}
            </Button>
          )}
          <Button 
            style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Événement
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid #10b981'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">Google Calendar connecté</span>
              </div>
              <Button
                onClick={loadGoogleEvents}
                disabled={isLoadingEvents}
                size="sm"
                variant="outline"
              >
                {isLoadingEvents ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Display */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
            {isConnected ? 'Événements Google Calendar' : 'Calendrier des Événements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
                Aucun événement planifié
              </h3>
              <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
                Connectez Google Calendar pour voir vos événements ou créez votre premier événement
              </p>
            </div>
          ) : isLoadingEvents ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Chargement des événements...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
                Aucun événement trouvé
              </h3>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Vos événements Google Calendar apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
                        {event.summary}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm mb-2" style={{ color: 'var(--app-text, #666666)' }}>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.start.dateTime && formatDate(event.start.dateTime)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.start.dateTime && formatTime(event.start.dateTime)} - {event.end.dateTime && formatTime(event.end.dateTime)}
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm mb-2" style={{ color: 'var(--app-text, #666666)' }}>
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Google Calendar
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const [hasRealConnection, setHasRealConnection] = useState(false);

  useEffect(() => {
    // Vérifier si Google Calendar est réellement connecté
    const savedConnection = localStorage.getItem('googleCalendarConnected');
    const realConnection = localStorage.getItem('googleCalendarRealConnection');
    
    if (savedConnection === 'true') {
      setIsConnected(true);
      if (realConnection === 'true') {
        setHasRealConnection(true);
        // Ici on chargerait les vrais événements depuis l'API Google Calendar
        // Pour l'instant, on laisse vide car la vraie API n'est pas configurée
      }
    }
  }, []);

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      // Vérifier si les clés API Google Calendar sont configurées
      const googleConfig = localStorage.getItem('googleCalendarConfig');
      
      if (!googleConfig) {
        toast.error('Configuration Google Calendar manquante. Veuillez configurer vos clés API dans les Préférences.');
        setIsConnecting(false);
        return;
      }

      // Simulation de la connexion OAuth Google Calendar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour une vraie implémentation, ici on ferait :
      // 1. Redirection vers Google OAuth
      // 2. Récupération du token d'accès
      // 3. Test de l'API Google Calendar
      
      localStorage.setItem('googleCalendarConnected', 'true');
      // Ne pas marquer comme vraie connexion car c'est une simulation
      // localStorage.setItem('googleCalendarRealConnection', 'true');
      
      setIsConnected(true);
      toast.success('Connexion simulée réussie ! Configurez les vraies clés API pour voir vos événements.');
      
    } catch (error) {
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    localStorage.removeItem('googleCalendarConnected');
    localStorage.removeItem('googleCalendarRealConnection');
    setIsConnected(false);
    setHasRealConnection(false);
    setEvents([]);
    toast.success('Déconnexion de Google Calendar réussie');
  };

  const loadRealGoogleEvents = async () => {
    setIsLoadingEvents(true);
    try {
      // Ici on ferait un appel à l'API Google Calendar avec les vraies clés
      // const response = await gapi.client.calendar.events.list({...});
      // setEvents(response.result.items);
      
      toast.info('Configuration API Google Calendar requise pour charger les événements réels');
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoadingEvents(false);
    }
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
          border: hasRealConnection ? '1px solid #10b981' : '1px solid #f59e0b'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasRealConnection ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Google Calendar connecté</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-600 font-medium">
                      Connexion simulée - Configurez les clés API dans Préférences
                    </span>
                  </>
                )}
              </div>
              {hasRealConnection && (
                <Button
                  onClick={loadRealGoogleEvents}
                  disabled={isLoadingEvents}
                  size="sm"
                  variant="outline"
                >
                  {isLoadingEvents ? 'Actualisation...' : 'Actualiser'}
                </Button>
              )}
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
            Calendrier des Événements
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
          ) : !hasRealConnection ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-amber-500" />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
                Configuration requise
              </h3>
              <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
                Configurez vos clés API Google Calendar dans les Préférences pour voir vos événements réels
              </p>
              <Button variant="outline" asChild>
                <a href="/preferences">
                  Aller aux Préférences
                </a>
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
                Aucun événement trouvé
              </h3>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Vos événements Google Calendar apparaîtront ici une fois la configuration terminée
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

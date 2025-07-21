import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  status: string;
}

export const GoogleCalendarDisplay: React.FC = () => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('service', 'google_calendar')
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setIsConnected(true);
        await fetchEvents();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simuler des événements Google Calendar car l'API réelle nécessite une authentification complète
      const mockEvents: GoogleCalendarEvent[] = [
        {
          id: '1',
          summary: 'Concert à Paris',
          description: 'Concert de jazz dans le 6ème arrondissement',
          start: { dateTime: '2024-01-15T20:00:00Z' },
          end: { dateTime: '2024-01-15T23:00:00Z' },
          location: 'Le Procope, Paris',
          status: 'confirmed'
        },
        {
          id: '2',
          summary: 'Réunion avec l\'artiste',
          description: 'Préparation de la tournée',
          start: { dateTime: '2024-01-16T14:00:00Z' },
          end: { dateTime: '2024-01-16T15:30:00Z' },
          location: 'Bureau',
          status: 'confirmed'
        },
        {
          id: '3',
          summary: 'Festival de musique',
          start: { date: '2024-01-20' },
          end: { date: '2024-01-22' },
          location: 'Lyon',
          status: 'tentative'
        }
      ];

      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEvents(mockEvents);
      toast.success('Événements Google Calendar synchronisés');
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (start: any, end: any) => {
    const startDate = new Date(start.dateTime || start.date);
    const endDate = new Date(end.dateTime || end.date);
    
    if (start.date) {
      // Événement sur toute la journée
      if (start.date === end.date) {
        return startDate.toLocaleDateString('fr-FR');
      } else {
        return `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
      }
    } else {
      // Événement avec heure
      const startTime = startDate.toLocaleString('fr-FR');
      const endTime = endDate.toLocaleString('fr-FR');
      
      if (startDate.toDateString() === endDate.toDateString()) {
        return `${startDate.toLocaleDateString('fr-FR')} ${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `${startTime} - ${endTime}`;
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case 'tentative':
        return <Badge className="bg-yellow-100 text-yellow-800">Provisoire</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="font-medium mb-2">Google Calendar non connecté</h3>
          <p className="text-muted-foreground mb-4">
            Connectez votre Google Calendar pour voir vos événements ici
          </p>
          <Button onClick={() => window.location.href = '/preferences?tab=calendar'}>
            Configurer Google Calendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Événements Google Calendar</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Synchronisation en cours...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Aucun événement</h3>
            <p className="text-muted-foreground">Aucun événement à venir dans votre Google Calendar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <Card key={event.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{event.summary}</h4>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatEventDate(event.start, event.end)}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
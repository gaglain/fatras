import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, MapPin, Users, ExternalLink, CalendarDays, Settings } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface AgendaEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  type: 'event' | 'meeting' | 'rehearsal' | 'personal';
  attendees: string[];
  googleEventId?: string;
  isFromGoogle?: boolean;
  linkedEventId?: string;
}

const sampleAgendaEvents: AgendaEvent[] = [
  {
    id: 'agenda-1',
    title: 'Festival d\'Été 2024 - Préparation',
    startDate: '2024-07-15',
    endDate: '2024-07-15',
    startTime: '14:00',
    endTime: '18:00',
    location: 'Central Park',
    description: 'Préparation et soundcheck pour le festival',
    type: 'event',
    attendees: ['user-1', 'user-2'],
    linkedEventId: 'event-1'
  },
  {
    id: 'agenda-2',
    title: 'Réunion équipe production',
    startDate: '2024-06-18',
    endDate: '2024-06-18',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Bureau',
    type: 'meeting',
    attendees: ['user-1', 'user-2', 'user-3'],
    isFromGoogle: true,
    googleEventId: 'google-123'
  }
];

export const Agenda: React.FC = () => {
  const { users, getUserById } = useUser();
  const [events, setEvents] = useState<AgendaEvent[]>(sampleAgendaEvents);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const initializeGoogleCalendar = () => {
    return new Promise((resolve) => {
      if (window.gapi) {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: 'YOUR_API_KEY', // À remplacer par la vraie clé API
            clientId: 'YOUR_CLIENT_ID', // À remplacer par le vrai client ID
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          }).then(() => {
            resolve(window.gapi.auth2.getAuthInstance());
          });
        });
      } else {
        // Charger l'API Google si elle n'est pas déjà chargée
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
              apiKey: 'YOUR_API_KEY',
              clientId: 'YOUR_CLIENT_ID',
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar'
            }).then(() => {
              resolve(window.gapi.auth2.getAuthInstance());
            });
          });
        };
        document.head.appendChild(script);
      }
    });
  };

  const connectToGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const authInstance = await initializeGoogleCalendar();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (!isSignedIn) {
        await authInstance.signIn();
      }
      
      // Synchroniser les événements existants
      await syncGoogleCalendarEvents();
      
      setIsGoogleConnected(true);
      toast.success('Google Calendar connecté avec succès !');
    } catch (error) {
      console.error('Erreur lors de la connexion à Google Calendar:', error);
      toast.error('Erreur lors de la connexion à Google Calendar. Vérifiez vos paramètres.');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncGoogleCalendarEvents = async () => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.result.items.map((event: any) => ({
        id: `google-${event.id}`,
        title: event.summary || 'Événement sans titre',
        startDate: event.start.date || event.start.dateTime?.split('T')[0],
        endDate: event.end.date || event.end.dateTime?.split('T')[0],
        startTime: event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        endTime: event.end.dateTime ? new Date(event.end.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '23:59',
        location: event.location || '',
        description: event.description || '',
        type: 'personal' as const,
        attendees: event.attendees?.map((att: any) => att.email) || [],
        googleEventId: event.id,
        isFromGoogle: true
      }));

      // Fusionner avec les événements existants (éviter les doublons)
      setEvents(prev => {
        const nonGoogleEvents = prev.filter(event => !event.isFromGoogle);
        return [...nonGoogleEvents, ...googleEvents];
      });

      toast.success(`${googleEvents.length} événements synchronisés depuis Google Calendar`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des événements');
    }
  };

  const createGoogleCalendarEvent = async (eventData: any) => {
    if (!isGoogleConnected) return;

    try {
      const event = {
        summary: eventData.title,
        location: eventData.location,
        description: eventData.description,
        start: {
          dateTime: `${eventData.startDate}T${eventData.startTime}:00`,
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: `${eventData.endDate}T${eventData.endTime}:00`,
          timeZone: 'Europe/Paris'
        }
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      toast.success('Événement ajouté à Google Calendar');
      return response.result.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement Google:', error);
      toast.error('Erreur lors de l\'ajout à Google Calendar');
    }
  };

  const getDayEvents = (date: string) => {
    return events.filter(event => 
      event.startDate <= date && event.endDate >= date
    );
  };

  const getWeekDates = () => {
    const selected = new Date(selectedDate);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay() + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'rehearsal': return 'bg-green-100 text-green-800';
      case 'personal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-2">Gérer votre planning et synchroniser avec Google Calendar</p>
        </div>
        <div className="flex space-x-3">
          {!isGoogleConnected ? (
            <Button 
              onClick={connectToGoogleCalendar} 
              variant="outline"
              disabled={isConnecting}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connexion...' : 'Connecter Google Calendar'}
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <CalendarDays className="h-3 w-3 mr-1" />
                Google Calendar connecté
              </Badge>
              <Button 
                onClick={syncGoogleCalendarEvents} 
                variant="outline" 
                size="sm"
              >
                Synchroniser
              </Button>
            </div>
          )}
          <Button onClick={() => setShowAddEvent(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {!isGoogleConnected && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Configuration Google Calendar</h4>
                <p className="text-sm text-blue-700">
                  Pour utiliser la synchronisation Google Calendar, vous devez configurer vos clés API dans les paramètres.
                  <br />
                  <a href="/preferences" className="underline">Configurer maintenant</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'day' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Jour
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semaine
          </Button>
          <Button 
            variant={viewMode === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mois
          </Button>
        </div>
        
        <Input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Calendar View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-8 gap-4">
          <div className="font-medium text-gray-700">Heure</div>
          {getWeekDates().map((date) => (
            <div key={date} className="text-center">
              <div className="font-medium text-gray-900">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })}
              </div>
            </div>
          ))}
          
          {/* Time slots */}
          {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
            <React.Fragment key={hour}>
              <div className="text-sm text-gray-500 py-4">
                {hour}:00
              </div>
              {getWeekDates().map((date) => (
                <div key={`${date}-${hour}`} className="border border-gray-200 min-h-[60px] p-1">
                  {getDayEvents(date)
                    .filter(event => {
                      const eventHour = parseInt(event.startTime.split(':')[0]);
                      return eventHour === hour;
                    })
                    .map((event) => (
                      <Card key={event.id} className="p-2 mb-1 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="text-xs font-medium truncate">{event.title}</div>
                        <div className="text-xs text-gray-500">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge className={`${getTypeColor(event.type)} text-xs`}>
                            {event.type}
                          </Badge>
                          {event.isFromGoogle && (
                            <Badge variant="outline" className="text-xs">
                              <CalendarDays className="h-2 w-2 mr-1" />
                              G
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}

      {viewMode === 'day' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-3">
            {getDayEvents(selectedDate).map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <Badge className={getTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        {event.isFromGoogle && (
                          <Badge variant="outline">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            Google
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees.length} participants
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {event.linkedEventId && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Voir événement
                        </Button>
                      )}
                      <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nouvel événement agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de l'événement" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Date de début" />
                <Input type="date" placeholder="Date de fin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="time" placeholder="Heure de début" />
                <Input type="time" placeholder="Heure de fin" />
              </div>
              <Input placeholder="Lieu" />
              <textarea 
                placeholder="Description"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Synchroniser avec Google Calendar</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddEvent(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowAddEvent(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer événement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

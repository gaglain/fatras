import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, MapPin, Users, Edit, Trash2, User } from 'lucide-react';

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

interface AgendaEventListProps {
  events: AgendaEvent[];
  allSupabaseEvents: any[];
  users: any[];
  getArtistName: (artistId?: string) => string | null;
  getEventTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
  onEdit: (event: AgendaEvent) => void;
  onDelete: (eventId: string) => void;
  onCreate: () => void;
}

export const AgendaEventList: React.FC<AgendaEventListProps> = ({
  events, allSupabaseEvents, users, getArtistName, getEventTypeColor, getStatusColor, onEdit, onDelete, onCreate
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Aucun événement planifié</h3>
        <p className="text-gray-600 mb-4">Commencez par créer votre premier événement</p>
        <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Créer un événement
        </Button>
      </div>
    );
  }

  const eventsByDay: { [key: string]: AgendaEvent[] } = {};
  [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .forEach(event => {
      const dateKey = new Date(event.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!eventsByDay[dateKey]) eventsByDay[dateKey] = [];
      eventsByDay[dateKey].push(event);
    });

  return (
    <div className="space-y-6">
      {Object.entries(eventsByDay).map(([dateKey, dayEvents]) => (
        <div key={dateKey} className="space-y-3">
          <h3 className="font-semibold text-lg text-primary capitalize sticky top-0 bg-background py-2 border-b">
            {dateKey}
          </h3>
          {dayEvents.map((event) => {
            const correspondingSupabaseEvent = allSupabaseEvents.find(e => e.id === event.id);
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
                          {event.type === 'concert' ? 'Concert' : event.type === 'meeting' ? 'Réunion' : 'Autre'}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === 'confirmed' ? 'Confirmé' : event.status === 'pending' ? 'En attente' : 'Annulé'}
                        </Badge>
                      </div>
                      {artistName && <p className="text-sm font-medium text-primary mb-2">Spectacle: {artistName}</p>}
                      {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {event.endDate && event.endDate !== event.startDate && (
                            <span> → {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{event.location}</div>
                        )}
                        {event.attendees > 0 && (
                          <div className="flex items-center"><Users className="h-4 w-4 mr-1" />{event.attendees} participants</div>
                        )}
                        <div className="flex items-center"><User className="h-4 w-4 mr-1" />{event.userName}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => onEdit(event)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(event.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

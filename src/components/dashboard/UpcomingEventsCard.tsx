
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';

const upcomingEvents = [
  {
    id: '1',
    title: 'Concert Acoustique - Sarah Mitchell',
    date: '2024-07-15',
    venue: 'Blue Note Jazz Club',
    city: 'Paris',
    status: 'confirmed',
    attendees: 120
  },
  {
    id: '2',
    title: 'Rock Legends Tour',
    date: '2024-08-10',
    venue: 'Olympia',
    city: 'Paris',
    status: 'pending',
    attendees: 2000
  },
  {
    id: '3',
    title: 'Festival Jazz & Blues',
    date: '2024-09-05',
    venue: 'Parc des Expositions',
    city: 'Lyon',
    status: 'confirmed',
    attendees: 5000
  }
];

export const UpcomingEventsCard: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="xl:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <Calendar className="h-5 w-5 mr-2" />
          Prochains Événements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium truncate text-gray-900">{event.title}</h4>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(event.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.venue}, {event.city}
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {event.attendees} participants
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

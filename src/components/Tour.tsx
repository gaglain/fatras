
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

const tourDates = [
  {
    id: '1',
    date: '2024-07-15',
    venue: 'Madison Square Garden',
    city: 'New York',
    country: 'USA',
    time: '20:00',
    status: 'available',
    artist: 'The Midnight Express'
  },
  {
    id: '2',
    date: '2024-07-18',
    venue: 'Boston Garden',
    city: 'Boston',
    country: 'USA',
    time: '19:30',
    status: 'sold-out',
    artist: 'The Midnight Express'
  },
  {
    id: '3',
    date: '2024-07-22',
    venue: 'L\'Olympia',
    city: 'Paris',
    country: 'France',
    time: '21:00',
    status: 'available',
    artist: 'Sarah Mitchell'
  },
  {
    id: '4',
    date: '2024-07-25',
    venue: 'Royal Albert Hall',
    city: 'Londres',
    country: 'UK',
    time: '20:30',
    status: 'limited',
    artist: 'Thunder Road'
  }
];

export const Tour: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Disponible</Badge>;
      case 'sold-out':
        return <Badge variant="destructive">Complet</Badge>;
      case 'limited':
        return <Badge variant="secondary">Places limitées</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tournée 2024
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez toutes les dates de concerts et réservez vos places pour vivre des moments inoubliables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tourDates.map((show) => (
            <Card key={show.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {show.venue}
                    </h3>
                    <p className="text-gray-600 font-medium">{show.artist}</p>
                  </div>
                  {getStatusBadge(show.status)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3" />
                    <span>{new Date(show.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-3" />
                    <span>{show.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3" />
                    <span>{show.city}, {show.country}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    disabled={show.status === 'sold-out'}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    {show.status === 'sold-out' ? 'Complet' : 'Réserver'}
                  </Button>
                  <Button variant="outline">
                    Plus d'infos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

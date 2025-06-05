
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

const sampleEvents = [
  {
    id: '1',
    title: 'Summer Festival 2024',
    artist: 'The Midnight Express',
    date: '2024-07-15',
    time: '20:00',
    venue: 'Central Park',
    location: 'Paris, France',
    price: '45€',
    status: 'Disponible',
    image: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Acoustic Night',
    artist: 'Sarah Mitchell',
    date: '2024-06-20',
    time: '19:30',
    venue: 'Blue Note Jazz Club',
    location: 'Lyon, France',
    price: '35€',
    status: 'Presque complet',
    image: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Rock Legends Tour',
    artist: 'Thunder Road',
    date: '2024-08-10',
    time: '21:00',
    venue: 'Zenith',
    location: 'Marseille, France',
    price: '55€',
    status: 'Disponible',
    image: '/placeholder.svg'
  }
];

export const FrontEvents: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'bg-green-100 text-green-800';
      case 'Presque complet':
        return 'bg-orange-100 text-orange-800';
      case 'Complet':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Événements à Venir</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ne manquez aucun de nos événements exceptionnels
          </p>
        </div>

        <div className="space-y-6">
          {sampleEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                  <div className="flex-shrink-0 mb-4 lg:mb-0">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full lg:w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-lg text-purple-600 font-medium">{event.artist}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue}, {event.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3 mt-4 lg:mt-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{event.price}</div>
                      <div className="text-sm text-gray-500">par personne</div>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Ticket className="h-4 w-4 mr-2" />
                      Réserver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

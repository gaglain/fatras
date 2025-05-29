
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  url?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  artist?: string;
}

const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Summer Music Festival 2024',
    type: 'Festival',
    date: '2024-07-15',
    venue: 'Central Park',
    url: 'https://summerfest2024.com',
    status: 'confirmed',
    artist: 'The Midnight Express'
  },
  {
    id: '2',
    name: 'Acoustic Night',
    type: 'Concert',
    date: '2024-06-20',
    venue: 'Blue Note Jazz Club',
    status: 'pending',
    artist: 'Sarah Mitchell'
  },
  {
    id: '3',
    name: 'Rock Legends Tour',
    type: 'Tour',
    date: '2024-08-10',
    venue: 'Madison Square Garden',
    url: 'https://rocklegends.com',
    status: 'confirmed',
    artist: 'Thunder Road'
  }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Manage concerts, festivals, and tour dates</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
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
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    {event.artist && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{event.artist}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.url && (
                    <div className="mt-3">
                      <a 
                        href={event.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Event Website
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Event Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Event Name" />
              <Input placeholder="Event Type (Concert, Festival, Tour)" />
              <Input type="date" placeholder="Event Date" />
              <Input placeholder="Venue" />
              <Input placeholder="Event URL (optional)" />
              <Input placeholder="Artist" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

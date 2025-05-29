
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Clock, ExternalLink, CheckSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  url?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  artist?: string;
  artistId?: string;
  contactId?: string;
  contactName?: string;
  relatedTasks?: Array<{
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    dueDate: string;
  }>;
}

const sampleEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Summer Music Festival 2024',
    type: 'Festival',
    date: '2024-07-15',
    venue: 'Central Park',
    url: 'https://summerfest2024.com',
    status: 'confirmed',
    artist: 'The Midnight Express',
    artistId: 'artist-1',
    contactId: 'contact-1',
    contactName: 'John Smith - MSG',
    relatedTasks: [
      { id: '1', title: 'Send contract to Madison Square Garden', status: 'todo', dueDate: '2024-06-15' }
    ]
  },
  {
    id: 'event-2',
    name: 'Acoustic Night',
    type: 'Concert',
    date: '2024-06-20',
    venue: 'Blue Note Jazz Club',
    status: 'pending',
    artist: 'Sarah Mitchell',
    artistId: 'artist-2',
    contactId: 'contact-2',
    contactName: 'Sarah Williams',
    relatedTasks: [
      { id: '2', title: 'Call venue about sound requirements', status: 'in-progress', dueDate: '2024-06-12' }
    ]
  },
  {
    id: 'event-3',
    name: 'Rock Legends Tour',
    type: 'Tour',
    date: '2024-08-10',
    venue: 'Madison Square Garden',
    url: 'https://rocklegends.com',
    status: 'confirmed',
    artist: 'Thunder Road',
    artistId: 'artist-3',
    contactId: 'contact-3',
    contactName: 'Mike Producer',
    relatedTasks: [
      { id: '3', title: 'Schedule meeting with artist management', status: 'done', dueDate: '2024-06-14' }
    ]
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                        <Link 
                          to="/artists" 
                          className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{event.artist}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  {event.contactName && (
                    <div className="mt-3">
                      <Link 
                        to="/contacts" 
                        className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                      >
                        <User className="h-4 w-4" />
                        <span>Contact: {event.contactName}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Related Tasks */}
                  {event.relatedTasks && event.relatedTasks.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Related Tasks:</span>
                      </div>
                      <div className="space-y-1">
                        {event.relatedTasks.map((task) => (
                          <Link
                            key={task.id}
                            to="/tasks"
                            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700">{task.title}</span>
                              <Badge className={`${getTaskStatusColor(task.status)} text-xs`}>
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
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

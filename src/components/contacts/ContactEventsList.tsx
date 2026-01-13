
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  venue?: string;
  city?: string;
  event_type?: string;
  status?: string;
  attendees_count?: number;
}

interface ContactEventsListProps {
  contactId: string;
}

export const ContactEventsList: React.FC<ContactEventsListProps> = ({ contactId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactEvents();
  }, [contactId]);

  const loadContactEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('contact_id', contactId)
        .order('start_date', { ascending: false });

      if (error) {
        return;
      }

      setEvents(data || []);
    } catch {
      // Silent - events loading failed
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement des événements...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Aucun événement lié à ce contact
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{event.title}</h4>
                {event.description && (
                  <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
              {event.status && (
                <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                  {event.status}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {event.start_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
              )}
              
              {event.venue && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.venue}</span>
                </div>
              )}
              
              {event.attendees_count && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{event.attendees_count}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

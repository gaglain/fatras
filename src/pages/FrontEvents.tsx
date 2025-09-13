
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const FrontEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data: eventsData, error } = await supabase
        .from('centralized_events')
        .select('*')
        .eq('status', 'confirmed')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('❌ Error loading events:', error);
      } else {
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('❌ Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return 'Prix à définir';
    if (min && max && min !== max) return `${min}€ - ${max}€`;
    return `${min || max}€`;
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

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Événements à Venir - MusiConnect"
        description="Ne manquez aucun de nos événements exceptionnels"
      />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Événements à Venir</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ne manquez aucun de nos événements exceptionnels
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun événement programmé pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                      {event.image && (
                        <div className="flex-shrink-0 mb-4 lg:mb-0">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full lg:w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status === 'confirmed' ? 'Confirmé' : 
                               event.status === 'pending' ? 'En attente' : 
                               event.status === 'cancelled' ? 'Annulé' : event.status}
                            </Badge>
                          </div>
                          {event.artist_id && (
                            <p className="text-lg text-purple-600 font-medium">{event.artist_id}</p>
                          )}
                          {event.description && (
                            <p className="text-gray-600 mt-2">{event.description}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(event.start_date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(event.start_date)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.venue && `${event.venue}, `}{event.city}
                          </div>
                        </div>

                        {event.event_type && (
                          <div className="flex items-center">
                            <Badge variant="outline">{event.event_type}</Badge>
                            {event.attendees_count && (
                              <span className="ml-3 text-sm text-gray-500">
                                Capacité: {event.attendees_count} personnes
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3 mt-4 lg:mt-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(event.budget_min, event.budget_max)}
                          </div>
                          <div className="text-sm text-gray-500">par personne</div>
                        </div>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={event.status !== 'confirmed'}
                        >
                          <Ticket className="h-4 w-4 mr-2" />
                          {event.status === 'confirmed' ? 'Réserver' : 'Indisponible'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

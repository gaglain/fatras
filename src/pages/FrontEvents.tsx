
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Ticket, Filter } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ScrollRevealCard: React.FC<{ children: React.ReactNode; index: number; className?: string }> = ({ children, index, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useScrollReveal(ref);
  
  return (
    <div 
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  );
};

export const FrontEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          artist:centralized_artists(id, name, image)
        `)
        .in('status', ['confirmed', 'option'])
        .order('start_date', { ascending: true });

      if (error) {
        setEvents([]);
      } else {
        setEvents(eventsData || []);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const artists = useMemo(() => {
    const artistMap = new Map<string, { id: string; name: string }>();
    events.forEach(event => {
      if (event.artist?.id && event.artist?.name) {
        artistMap.set(event.artist.id, { id: event.artist.id, name: event.artist.name });
      }
    });
    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedArtist === 'all') return events;
    return events.filter(event => event.artist?.id === selectedArtist);
  }, [events, selectedArtist]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'option':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
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

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: any[] = [];
    const past: any[] = [];
    
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.start_date);
      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });
    
    upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    past.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [filteredEvents]);

  const renderEventCard = (event: any, isPast: boolean = false, index: number = 0) => (
    <ScrollRevealCard key={event.id} index={index}>
      <Card className={`hover:shadow-lg transition-shadow ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
            {event.image && (
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full lg:w-32 h-32 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-foreground">{event.title}</h3>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status === 'confirmed' ? 'Confirmé' : 
                     event.status === 'option' ? 'Option' :
                     event.status === 'pending' ? 'En attente' : 
                     event.status === 'cancelled' ? 'Annulé' : event.status}
                  </Badge>
                </div>
                {event.artist && (
                  <p className="text-lg text-primary font-medium mb-2">
                    Spectacle : {event.artist.name}
                  </p>
                )}
                {event.description && (
                  <p className="text-muted-foreground mt-2">{event.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
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
                  {event.venue && `${event.venue}, `}{event.postal_code && `${event.postal_code} `}{event.city}
                </div>
              </div>

              {event.event_type && (
                <div className="flex items-center">
                  <Badge variant="outline">{event.event_type}</Badge>
                  {event.attendees_count && (
                    <span className="ml-3 text-sm text-muted-foreground">
                      Capacité: {event.attendees_count} personnes
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-3 mt-4 lg:mt-0">
              {(event.budget_min || event.budget_max) && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {event.budget_min && event.budget_max && event.budget_min !== event.budget_max 
                      ? `${event.budget_min}€ - ${event.budget_max}€` 
                      : `${event.budget_min || event.budget_max}€`}
                  </div>
                  <div className="text-sm text-muted-foreground">par personne</div>
                </div>
              )}
              {!isPast && event.booking_url && (
                <Button asChild>
                  <a href={event.booking_url} target="_blank" rel="noopener noreferrer">
                    <Ticket className="h-4 w-4 mr-2" />
                    Réserver
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollRevealCard>
  );

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Événements & Spectacles à Venir | Fatras"
        description="Découvrez les prochaines dates de spectacles de Fatras - spectacles de rue musicaux, concerts-théâtre et arts de la rue partout en France."
        keywords="spectacles, événements, dates, tournée, Fatras, arts de la rue, festivals"
      />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">Événements</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ne manquez aucun de nos événements exceptionnels
            </p>
          </div>

          {artists.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 bg-card rounded-lg shadow-sm p-2 border">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                  <SelectTrigger className="w-[200px] border-0 shadow-none">
                    <SelectValue placeholder="Tous les spectacles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les spectacles</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                À venir
                {upcomingEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{upcomingEvents.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                Passés
                {pastEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{pastEvents.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">Aucun événement à venir pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingEvents.map((event, i) => renderEventCard(event, false, i))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">Aucun événement passé.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pastEvents.map((event, i) => renderEventCard(event, true, i))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

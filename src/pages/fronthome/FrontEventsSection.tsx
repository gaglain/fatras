import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';

interface FrontEventsSectionProps {
  events: any[];
  title?: string;
}

export const FrontEventsSection: React.FC<FrontEventsSectionProps> = ({ events, title }) => {
  return (
    <section id="spectacles" className="py-12 px-4 bg-background" aria-labelledby="spectacles-heading">
      <div className="container mx-auto">
        <h2 id="spectacles-heading" className="text-3xl font-bold text-center mb-8">
          {title || 'Nos Spectacles de Rue Musicaux'}
        </h2>
        
        {Array.isArray(events) && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {event.artist?.image && (
                  <div className="relative h-48 w-full">
                    <OptimizedImage 
                      src={event.artist.image} 
                      alt={event.artist.name || event.title}
                      className="w-full h-full"
                      objectFit="cover"
                      intrinsicWidth={400}
                      intrinsicHeight={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-primary/90 text-primary-foreground">
                        {event.artist.name}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {event.title}
                  </CardTitle>
                  {event.artist && !event.artist.image && (
                    <p className="text-sm text-primary font-medium">
                      Spectacle : {event.artist.name}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                  )}
                  
                  {event.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {new Date(event.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  
                  {(event.venue || event.city) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {event.venue}
                      {event.postal_code && ` - ${event.postal_code}`}
                      {event.city && ` ${event.city}`}
                    </div>
                  )}
                  
                  {event.attendees_count && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {event.attendees_count} places
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="secondary">{event.event_type || 'Spectacle'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Aucun spectacle programmé pour le moment</p>
          </div>
        )}
      </div>
    </section>
  );
};

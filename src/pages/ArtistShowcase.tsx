import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Music, Users, Mail, Phone, Globe, Instagram, Facebook, Youtube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  name: string;
  genre: string;
  bio?: string;
  image?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  upcoming_shows: number;
  total_shows: number;
  rating?: number;
  status: string;
  current_tour?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  venue?: string;
  city?: string;
  start_date?: string;
  image?: string;
  artist_id?: string;
}

export const ArtistShowcase: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  const fetchShowcaseData = async () => {
    try {
      // Récupérer les artistes actifs
      const { data: artistsData } = await supabase
        .from('centralized_artists')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      // Récupérer les événements à venir
      const { data: eventsData } = await supabase
        .from('centralized_events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(6);

      setArtists(artistsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des artistes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Nos Artistes</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#artists" className="text-muted-foreground hover:text-primary transition-colors">Artistes</a>
              <a href="#events" className="text-muted-foreground hover:text-primary transition-colors">Événements</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Découvrez nos
            <span className="text-primary block">artistes exceptionnels</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Une sélection d'artistes talentueux pour vos événements musicaux, 
            concerts et festivals. Chaque artiste apporte sa créativité unique.
          </p>
        </div>
      </section>

      {/* Artists Section */}
      <section id="artists" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Nos Artistes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <Card key={artist.id} className="border-border/50 hover:shadow-lg transition-shadow overflow-hidden">
                {artist.image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{artist.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {artist.genre}
                      </Badge>
                    </div>
                    {artist.rating && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{artist.rating}</div>
                        <div className="text-xs text-muted-foreground">Note</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {artist.bio && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {artist.bio}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">{artist.upcoming_shows}</div>
                      <div className="text-xs text-muted-foreground">Concerts à venir</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">{artist.total_shows}</div>
                      <div className="text-xs text-muted-foreground">Concerts totaux</div>
                    </div>
                  </div>

                  {artist.current_tour && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        En tournée: {artist.current_tour}
                      </Badge>
                    </div>
                  )}

                  <div className="flex justify-center space-x-2">
                    {artist.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={artist.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {artist.instagram && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {artist.facebook && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={artist.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {artist.contact_email && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${artist.contact_email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Événements à venir
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="border-border/50 hover:shadow-lg transition-shadow">
                {event.image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {event.start_date && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                  {(event.venue || event.city) && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.venue && event.city ? `${event.venue}, ${event.city}` : (event.venue || event.city)}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8 text-foreground">
            Travaillons ensemble
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Vous recherchez des artistes pour votre événement ? 
            Contactez-nous pour découvrir comment nos talents peuvent sublimer votre projet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="mailto:contact@bookingmanager.fr">
                <Mail className="h-5 w-5 mr-2" />
                Nous contacter
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <a href="tel:+33123456789">
                <Phone className="h-5 w-5 mr-2" />
                Appelez-nous
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/40 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Music className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">BookingManager</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Votre partenaire pour des événements musicaux d'exception
          </p>
          <div className="text-sm text-muted-foreground">
            <p>&copy; 2024 BookingManager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
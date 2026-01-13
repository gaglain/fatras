import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Music, Star, Users, Globe, Instagram, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  image: string;
  status: string;
  upcoming_shows: number;
  total_shows: number;
  rating: number;
  contact_email: string;
  contact_phone: string;
  website: string;
  instagram: string;
  facebook: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  start_date: string;
  artist_id: string;
  status: string;
}

export const FrontArtistShowcase: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les artistes depuis centralized_artists
        const { data: artistsData, error: artistsError } = await supabase
          .from('centralized_artists')
          .select('*')
          .eq('status', 'active')
          .order('rating', { ascending: false });

        if (artistsError) {
          console.error('Erreur lors du chargement des artistes:', artistsError);
        } else {
          setArtists(artistsData || []);
        }

        // Récupérer les événements depuis centralized_events
        const { data: eventsData, error: eventsError } = await supabase
          .from('centralized_events')
          .select('*')
          .eq('status', 'confirmed')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (eventsError) {
          console.error('Erreur lors du chargement des événements:', eventsError);
        } else {
          setEvents(eventsData || []);
        }
      } catch (error) {
        console.error('Erreur générale:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Découvrez Nos Artistes
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Une sélection exceptionnelle d'artistes pour vos événements
            </p>
            <div className="flex justify-center space-x-8 text-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
                {artists.length} Artistes
              </div>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                {events.length} Événements à venir
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Section Artistes */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nos Artistes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Découvrez les talents que nous représentons
            </p>
          </div>

          {artists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Aucun artiste disponible
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Nos artistes seront bientôt présentés ici
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {artist.image ? (
                      <img 
                        src={artist.image} 
                        alt={artist.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                        <Music className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-800">
                        {artist.genre}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{artist.name}</span>
                      {artist.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm">{artist.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {artist.bio}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {artist.upcoming_shows} événements à venir
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {artist.total_shows} événements réalisés
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      {artist.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={artist.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {artist.instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {artist.facebook && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={artist.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Section Événements à venir */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Événements à Venir
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Ne manquez pas nos prochains spectacles
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Aucun événement programmé
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Restez connecté pour découvrir nos prochains événements
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="outline" className="w-fit">
                      {event.status}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.start_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue}, {event.city}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Contactez-nous</h3>
          <p className="text-gray-300 mb-6">
            Intéressé par l'un de nos artistes ? N'hésitez pas à nous contacter.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Prendre contact
          </Button>
        </div>
      </footer>
    </div>
  );
};
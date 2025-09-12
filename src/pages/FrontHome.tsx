import React, { useState, useEffect } from 'react';
import { FrontLayout } from '@/components/FrontLayout';
import { BlockEditor } from '@/components/website/BlockEditor';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useFrontDataSync } from '@/hooks/useFrontDataSync';

export const FrontHome: React.FC = () => {
  const [homePageBlocks, setHomePageBlocks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Hook de synchronisation pour le front
  const { forceSync } = useFrontDataSync();

  useEffect(() => {
    loadAllData();
    
    // Écouter les changements de localStorage et forcer le rechargement
    const handleStorageChange = () => {
      console.log('📱 Storage change detected in FrontHome, reloading data');
      loadAllData();
    };

    const handleFrontDataRefresh = () => {
      console.log('🔄 Front data refresh event detected');
      loadAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsUpdated', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleStorageChange);
    window.addEventListener('frontDataRefresh', handleFrontDataRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsUpdated', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleStorageChange);
      window.removeEventListener('frontDataRefresh', handleFrontDataRefresh);
    };
  }, []);

  const loadAllData = async () => {
    console.log('🔄 Loading all front data...');
    setLoading(true);
    
    try {
      // Charger les paramètres du site
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSiteSettings(settings);
        console.log('⚙️ Site settings loaded:', settings.siteName);
      }

      // Charger les événements depuis Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('centralized_events')
        .select('*')
        .eq('status', 'confirmed')
        .order('start_date', { ascending: true })
        .limit(6);

      if (eventsError) {
        console.error('❌ Error loading events:', eventsError);
      } else {
        setEvents(eventsData || []);
        console.log('🎭 Events loaded:', eventsData?.length);
      }

      // Charger les artistes depuis Supabase
      const { data: artistsData, error: artistsError } = await supabase
        .from('centralized_artists')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(6);

      if (artistsError) {
        console.error('❌ Error loading artists:', artistsError);
      } else {
        setArtists(artistsData || []);
        console.log('🎤 Artists loaded:', artistsData?.length);
      }

      // Charger la page d'accueil personnalisée
      loadHomePage();
      
    } catch (error) {
      console.error('❌ Error loading front data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHomePage = () => {
    try {
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const pages = JSON.parse(savedPages);
        const homePage = pages.find((page: any) => page.type === 'home' || page.slug === '/');
        
        if (homePage && homePage.blocks) {
          console.log('🏠 Loading custom home page blocks:', homePage.blocks.length);
          setHomePageBlocks(homePage.blocks);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error loading home page:', error);
    }
    
    // Page d'accueil par défaut avec spectacles
    setHomePageBlocks([
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: siteSettings.siteName || 'Bienvenue sur notre site',
          subtitle: siteSettings.siteDescription || 'Découvrez nos spectacles et artistes',
          buttonText: 'Voir nos spectacles',
          buttonLink: '#spectacles'
        }
      },
      {
        id: 'events-section',
        type: 'events',
        content: {
          title: 'Nos Spectacles à Venir',
          showAll: false
        }
      },
      {
        id: 'artists-section',
        type: 'artists', 
        content: {
          title: 'Nos Artistes',
          showAll: false
        }
      }
    ]);
  };

  if (loading) {
    return (
      <FrontLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </FrontLayout>
    );
  }

  return (
    <FrontLayout>
      <div className="min-h-screen">
        {homePageBlocks.map((block, index) => (
          <div key={block.id || index} className="block-container">
            
            {/* Section Hero */}
            {block.type === 'hero' && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 px-4">
                <div className="container mx-auto text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                    {block.content?.title || siteSettings.siteName || 'Bienvenue'}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                    {block.content?.subtitle || siteSettings.siteDescription || 'Découvrez notre univers'}
                  </p>
                  {block.content?.buttonText && (
                    <a 
                      href={block.content?.buttonLink || '#'}
                      className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {block.content.buttonText}
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Section Spectacles */}
            {block.type === 'events' && (
              <div id="spectacles" className="py-12 px-4 bg-background">
                <div className="container mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Spectacles'}
                  </h2>
                  
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              {event.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {event.description && (
                              <p className="text-muted-foreground text-sm">{event.description}</p>
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
                            
                            {event.venue && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {event.venue}
                                {event.city && `, ${event.city}`}
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
                              <Badge variant="outline">{event.status}</Badge>
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
              </div>
            )}
            
            {/* Section Artistes */}
            {block.type === 'artists' && (
              <div className="py-12 px-4 bg-muted/20">
                <div className="container mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Artistes'}
                  </h2>
                  
                  {artists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artists.map((artist) => (
                        <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 text-center">
                            {artist.photo_url && (
                              <img 
                                src={artist.photo_url} 
                                alt={artist.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                              />
                            )}
                            <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                            {artist.genre && (
                              <Badge variant="outline" className="mb-2">{artist.genre}</Badge>
                            )}
                            {artist.bio && (
                              <p className="text-muted-foreground text-sm">{artist.bio}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Aucun artiste enregistré pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </FrontLayout>
  );
};
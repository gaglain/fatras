import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FrontLayout } from '@/components/FrontLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { useFrontDataSync } from '@/hooks/useFrontDataSync';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';

// Composant Hero avec effet hover
const HeroBlock: React.FC<{ content: any; siteSettings: any }> = ({ content, siteSettings }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Toujours utiliser "Fatras" comme titre par défaut
  const title = 'Fatras';
  const subtitle = 'Spectacle de rue & de scène';
  const backgroundImage = content?.backgroundImage;
  const buttonText = content?.buttonText || 'Découvrir nos Spectacles';
  const buttonLink = content?.buttonLink || '#spectacles';

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image or gradient */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      )}
      
      {/* Overlay that darkens on hover */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isHovered ? 'opacity-60' : 'opacity-30'
        }`}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 lg:mb-6 leading-tight tracking-tight drop-shadow-lg">
          {title}
        </h1>
        
        {/* Presentation text that appears on hover */}
        <div 
          className={`transition-all duration-500 ease-out ${
            isHovered 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-8 text-white/90 font-light tracking-wide">
            {subtitle}
          </p>
          {buttonText && (
            buttonLink?.startsWith('#') ? (
              <a 
                href={buttonLink}
                className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base lg:text-lg font-medium"
              >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </a>
            ) : (
              <Link 
                to={buttonLink || '/front'}
                className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base lg:text-lg font-medium"
              >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export const FrontHome: React.FC = () => {
  const [homePageBlocks, setHomePageBlocks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Hook de synchronisation pour le front
  const { forceSync } = useFrontDataSync();

  useEffect(() => {
    loadAllData({ silent: false });
    
    // Écouter les changements de localStorage et forcer le rechargement
    const handleStorageChange = () => {
      console.log('📱 Storage change detected in FrontHome, reloading data');
      loadAllData({ silent: true });
    };

    const handleFrontDataRefresh = () => {
      console.log('🔄 Front data refresh event detected');
      loadAllData({ silent: true });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsUpdated', handleStorageChange);
    window.addEventListener('siteSettingsUpdated', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleStorageChange);
    window.addEventListener('websitePagesSaved', handleStorageChange);
    window.addEventListener('frontDataRefresh', handleFrontDataRefresh);
    // Ajouter compatibilité avec les nouveaux événements émis par le manager
    window.addEventListener('websiteConfigChanged', handleStorageChange);
    window.addEventListener('siteConfigChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsUpdated', handleStorageChange);
      window.removeEventListener('siteSettingsUpdated', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleStorageChange);
      window.removeEventListener('websitePagesSaved', handleStorageChange);
      window.removeEventListener('frontDataRefresh', handleFrontDataRefresh);
      window.removeEventListener('websiteConfigChanged', handleStorageChange);
      window.removeEventListener('siteConfigChanged', handleStorageChange);
    };
  }, []);

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(`Timeout while ${label} (${ms}ms)`));
      }, ms);
    });

    try {
      // Supabase builders are "thenable" but not real Promises — normalize first
      const normalized = Promise.resolve(promise);
      return await Promise.race([normalized, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const loadAllData = async (opts?: { silent?: boolean }) => {
    console.log('🔄 Loading all front data...');

    const watchdogId = !opts?.silent
      ? window.setTimeout(() => {
          console.warn('⏱️ FrontHome load timeout: forcing UI render');
          setLoading(false);
        }, 12000)
      : undefined;

    if (!opts?.silent) setLoading(true);

    let userId: string | undefined;

    try {
      // 1) Auth (optionnel) — ne doit jamais bloquer le rendu public
      try {
        const { data: authData } = await withTimeout(supabase.auth.getUser(), 4000, 'getting current user');
        userId = authData?.user?.id;
      } catch (e) {
        console.warn('⚠️ FrontHome auth.getUser failed (public mode continues):', e);
      }

      // 2) Settings (best-effort)
      try {
        const designQuery = supabase.from('website_designs').select('*').limit(1);
        const { data: designData } = userId
          ? await withTimeout(designQuery.eq('user_id', userId).maybeSingle(), 6000, 'loading website_designs (by user_id)')
          : await withTimeout(designQuery.maybeSingle(), 6000, 'loading website_designs (public)');

        if (designData) {
          setSiteSettings({
            siteName: designData.site_name || 'Mon Site',
            siteDescription: '',
            logo: designData.logo,
            primaryColor: designData.primary_color,
            secondaryColor: designData.secondary_color,
          });
          console.log('⚙️ Site settings loaded from Supabase:', designData.site_name);
        } else {
          const savedSettings = localStorage.getItem('websiteSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setSiteSettings(settings);
            console.log('⚙️ Site settings loaded from localStorage:', settings.siteName);
          }
        }
      } catch (e) {
        console.warn('⚠️ FrontHome settings load failed:', e);
      }

      // 3) Events (best-effort) - Only future events with artist data
      try {
        const now = new Date().toISOString();
        const { data: eventsData, error: eventsError } = await withTimeout(
          supabase
            .from('events')
            .select(`
              *,
              artist:centralized_artists(id, name, image)
            `)
            .eq('status', 'confirmed')
            .gte('start_date', now)
            .order('start_date', { ascending: true })
            .limit(6),
          8000,
          'loading events'
        );

        if (eventsError) {
          console.error('❌ Error loading events:', eventsError);
          setEvents([]);
        } else {
          setEvents(eventsData || []);
          console.log('🎭 Events loaded:', eventsData?.length);
        }
      } catch (e) {
        console.warn('⚠️ FrontHome events load failed:', e);
        setEvents([]);
      }

      // 4) Artists (best-effort) - Only touring artists
      try {
        const { data: artistsData, error: artistsError } = await withTimeout(
          supabase
            .from('centralized_artists')
            .select('*')
            .eq('is_touring', true)
            .limit(6),
          8000,
          'loading artists'
        );

        if (!artistsError && artistsData?.length) {
          setArtists(artistsData);
          console.log('🎤 Artists loaded from Supabase:', artistsData.length);
        } else {
          try {
            const savedArtists = localStorage.getItem('backoffice_artists');
            if (savedArtists) {
              const parsedArtists = JSON.parse(savedArtists);
              setArtists(parsedArtists.slice(0, 6) || []);
            } else {
              setArtists([]);
            }
          } catch (error) {
            console.error('❌ Error loading artists:', error);
            setArtists([]);
          }
        }
      } catch (e) {
        console.warn('⚠️ FrontHome artists load failed:', e);
        setArtists([]);
      }

      // 5) Homepage content (always attempt)
      try {
        await withTimeout(loadHomePage(userId), 8000, 'loading homepage');
      } catch (e) {
        console.warn('⚠️ FrontHome homepage load failed, using default blocks:', e);
        // If homepage load fails unexpectedly, ensure we still have something to render.
        setHomePageBlocks([]);
        await loadHomePage(undefined);
      }
    } catch (error) {
      console.error('❌ Error loading front data:', error);
      // Ensure we still render something
      await loadHomePage(undefined);
    } finally {
      if (watchdogId) window.clearTimeout(watchdogId);
      if (!opts?.silent) setLoading(false);
    }
  };

  const loadHomePage = async (userId?: string) => {
    try {
      // 1. D'abord essayer de charger depuis Supabase website_pages
      console.log('🏠 Loading homepage from Supabase...');
      
      // Query for published homepage - don't filter by user_id for public access
      const { data: supabaseHomePage, error } = await supabase
        .from('website_pages')
        .select('*')
        .or('slug.eq./,slug.eq.home,slug.eq.accueil,slug.eq.')
        .eq('status', 'published')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error loading homepage from Supabase:', error);
      }
      
      console.log('🔍 Supabase homepage result:', supabaseHomePage ? 'found' : 'not found');
      
      if (supabaseHomePage?.content) {
        let blocks: any[] = [];
        const rawContent = supabaseHomePage.content as any;
        
        // Le content peut être un objet avec blocks ou directement un tableau
        if (typeof rawContent === 'string') {
          try {
            const parsed = JSON.parse(rawContent);
            blocks = Array.isArray(parsed) ? parsed : (parsed?.blocks || []);
          } catch {
            blocks = [];
          }
        } else if (Array.isArray(rawContent)) {
          blocks = rawContent;
        } else if (rawContent && typeof rawContent === 'object' && rawContent.blocks) {
          blocks = rawContent.blocks;
        }
        
        if (blocks.length > 0) {
          console.log('🏠 Loading home page blocks from Supabase:', blocks.length);
          setHomePageBlocks(blocks);
          return;
        }
      }
      
      // 2. Fallback: charger depuis localStorage
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const parsed = JSON.parse(savedPages);
        const pages: any[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as any)?.data)
            ? (parsed as any).data
            : Array.isArray((parsed as any)?.pages)
              ? (parsed as any).pages
              : [];

        const homePage = pages.find((page: any) => 
          page?.slug === '/' || 
          page?.slug === 'home' || 
          page?.slug === 'accueil' ||
          page?.slug === ''
        );
        
        let blocks: any[] = [];
        if (homePage?.content) {
          if (Array.isArray(homePage.content)) {
            blocks = homePage.content;
          } else if (homePage.content?.blocks) {
            blocks = homePage.content.blocks;
          }
        } else if (Array.isArray(homePage?.blocks)) {
          blocks = homePage.blocks;
        }
        
        if (blocks.length > 0) {
          console.log('🏠 Loading custom home page blocks from localStorage:', blocks.length);
          setHomePageBlocks(blocks);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error loading home page:', error);
    }
    
    // 3. Page d'accueil par défaut avec spectacles
    setHomePageBlocks([
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Fatras',
          subtitle: 'Spectacle de rue & de scène',
          buttonText: 'Découvrir nos Spectacles',
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
          title: 'Nos Spectacles',
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
      <SEOHead 
        title="Fatras - Spectacle de rue & de scène"
        description="Fatras, compagnie de spectacle de rue et de scène. Découvrez nos créations artistiques uniques, nos dates de tournée et réservez nos spectacles pour vos événements."
        keywords="spectacle de rue, spectacle de scène, compagnie artistique, Fatras, festivals, arts de la rue, événements culturels"
        url="https://fatras.net/"
      />
      <div className="min-h-screen">
        {Array.isArray(homePageBlocks) && homePageBlocks.length > 0 ? homePageBlocks.map((block, index) => (
          <div key={block.id || index} className="block-container">
            
            {/* Section Hero avec effet hover */}
            {block.type === 'hero' && (
              <HeroBlock 
                content={block.content} 
                siteSettings={siteSettings}
              />
            )}
            
            {/* Section Spectacles */}
            {(block.type === 'events' || block.type === 'events-list') && (
              <div id="spectacles" className="py-12 px-4 bg-background">
                <div className="container mx-auto">
                   <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Spectacles'}
                  </h2>
                  
                  {Array.isArray(events) && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                          {/* Image de couverture de l'artiste */}
                          {event.artist?.image && (
                            <div className="relative h-48 w-full">
                              <img 
                                src={event.artist.image} 
                                alt={event.artist.name || event.title}
                                className="w-full h-full object-cover"
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
                            {/* Nom de l'artiste si pas d'image */}
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
            {(block.type === 'artists' || block.type === 'artists-grid') && (
              <div className="py-12 px-4 bg-muted/20">
                <div className="container mx-auto">
                   <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Spectacles'}
                  </h2>
                  
                  {Array.isArray(artists) && artists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artists.map((artist) => (
                        <Card key={artist.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                          {/* Image de couverture complète sans recadrage */}
                          {artist.image && (
                            <div className="relative w-full bg-muted">
                              <img 
                                src={artist.image} 
                                alt={artist.name}
                                className="w-full h-auto object-contain"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                                {artist.genre && (
                                  <Badge className="bg-primary/90 text-primary-foreground">{artist.genre}</Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Fallback sans image */}
                          {!artist.image && (
                            <CardContent className="p-6 text-center">
                              <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                              {artist.genre && (
                                <Badge variant="outline" className="mb-2">{artist.genre}</Badge>
                              )}
                            </CardContent>
                          )}
                          {/* Description complète */}
                          {artist.short_description && (
                            <CardContent className="p-4">
                              <p className="text-muted-foreground text-sm">{artist.short_description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Aucun spectacle enregistré pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Section Texte */}
            {block.type === 'text' && (
              <div className="py-8 px-4 bg-background">
                <div className="container mx-auto">
                  <div 
                    className={`text-${block.content?.alignment || 'left'} ${
                      block.content?.size === 'small' ? 'text-sm' :
                      block.content?.size === 'large' ? 'text-lg' : 'text-base'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {block.content?.content || 'Contenu du texte...'}
                  </div>
                </div>
              </div>
            )}

            {/* Section Image */}
            {block.type === 'image' && block.content?.src && (
              <div className="py-8 px-4 bg-background">
                <div className="container mx-auto">
                  <div className={`text-${block.content?.alignment || 'center'}`}>
                    <img
                      src={block.content.src}
                      alt={block.content.alt || ''}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                    />
                    {block.content.caption && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {block.content.caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )) : (
          <div className="py-12 px-4">
            <div className="container mx-auto text-center text-muted-foreground">
              <p>Chargement de la page d'accueil...</p>
            </div>
          </div>
        )}
      </div>
    </FrontLayout>
  );
};
import React, { useState, useEffect } from 'react';
import { FrontLayout } from '@/components/FrontLayout';
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

      // 3) Events (best-effort)
      try {
        const { data: eventsData, error: eventsError } = await withTimeout(
          supabase
            .from('events')
            .select('*')
            .eq('status', 'confirmed')
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

      // 4) Artists (best-effort)
      try {
        const { data: artistsData, error: artistsError } = await withTimeout(
          supabase.from('centralized_artists').select('*').limit(6),
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
      <div className="min-h-screen">
        {Array.isArray(homePageBlocks) && homePageBlocks.length > 0 ? homePageBlocks.map((block, index) => (
          <div key={block.id || index} className="block-container">
            
            {/* Section Hero */}
            {block.type === 'hero' && (
              <div
                className="relative py-16 px-4"
                style={block.content?.backgroundImage ? {
                  backgroundImage: `url(${block.content.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className="absolute inset-0 bg-background/60" aria-hidden="true"></div>
                <div className="container mx-auto text-center relative">
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
            {(block.type === 'events' || block.type === 'events-list') && (
              <div id="spectacles" className="py-12 px-4 bg-background">
                <div className="container mx-auto">
                   <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Spectacles'}
                  </h2>
                  
                  {Array.isArray(events) && events.length > 0 ? (
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
            {(block.type === 'artists' || block.type === 'artists-grid') && (
              <div className="py-12 px-4 bg-muted/20">
                <div className="container mx-auto">
                   <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Spectacles'}
                  </h2>
                  
                  {Array.isArray(artists) && artists.length > 0 ? (
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
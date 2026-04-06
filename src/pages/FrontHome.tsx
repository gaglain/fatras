import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FrontLayout } from '@/components/FrontLayout';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight } from 'lucide-react';
import { useFrontDataSync } from '@/hooks/useFrontDataSync';
import { useFrontDataCache, CACHE_KEYS } from '@/hooks/useFrontDataCache';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { OptimizedImage } from '@/components/OptimizedImage';
import { FrontEventsSection } from './fronthome/FrontEventsSection';
import { FrontArtistsSection } from './fronthome/FrontArtistsSection';

// Composant Hero avec effet hover
const HeroBlock: React.FC<{ content: any; siteSettings: any }> = ({ content, siteSettings }) => {
  const [isHovered, setIsHovered] = useState(false);
  const title = 'Fatras';
  const subtitle = 'Spectacle de rue musical & théâtre de rue participatif';
  const backgroundImage = content?.backgroundImage;
  const buttonText = content?.buttonText || 'Découvrir nos Spectacles de Rue';
  const buttonLink = content?.buttonLink || '#spectacles';

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt="Hero background"
          width={1920}
          height={1080}
          loading="eager"
          decoding="sync"
          // @ts-ignore
          fetchpriority="high"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      )}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${isHovered ? 'opacity-60' : 'opacity-30'}`} />
      <div className="relative z-10 text-center text-white px-4 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 lg:mb-6 leading-tight tracking-tight drop-shadow-lg">{title}</h1>
        <div className={`transition-all duration-500 ease-out ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-8 text-white/90 font-light tracking-wide">{subtitle}</p>
          {buttonText && (
            buttonLink?.startsWith('#') ? (
              <a href={buttonLink} className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base lg:text-lg font-medium">
                {buttonText}<ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
              </a>
            ) : (
              <Link to={buttonLink || '/front'} className="inline-flex items-center px-6 lg:px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-base lg:text-lg font-medium">
                {buttonText}<ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
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
  const { forceSync } = useFrontDataSync();
  const { fetchWithCache, clearCache } = useFrontDataCache();

  useEffect(() => {
    loadAllData({ silent: false });
    const handleStorageChange = () => loadAllData({ silent: true });
    const handleFrontDataRefresh = () => loadAllData({ silent: true });
    const events_list = ['storage', 'websiteSettingsUpdated', 'siteSettingsUpdated', 'websiteDesignUpdated', 'websitePagesSaved', 'websiteConfigChanged', 'siteConfigChanged'];
    events_list.forEach(e => window.addEventListener(e, handleStorageChange));
    window.addEventListener('frontDataRefresh', handleFrontDataRefresh);
    return () => {
      events_list.forEach(e => window.removeEventListener(e, handleStorageChange));
      window.removeEventListener('frontDataRefresh', handleFrontDataRefresh);
    };
  }, []);

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`Timeout while ${label} (${ms}ms)`)), ms);
    });
    try {
      return await Promise.race([Promise.resolve(promise), timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const loadAllData = async (opts?: { silent?: boolean }) => {
    const watchdogId = !opts?.silent ? window.setTimeout(() => setLoading(false), 12000) : undefined;
    if (!opts?.silent) setLoading(true);
    let userId: string | undefined;

    try {
      try {
        const { data: authData } = await withTimeout(supabase.auth.getUser(), 4000, 'getting current user');
        userId = authData?.user?.id;
      } catch { /* public mode */ }

      try {
        const designData = await fetchWithCache(CACHE_KEYS.WEBSITE_DESIGN, async () => {
          const designQuery = supabase.from('website_designs').select('*').limit(1);
          const { data } = userId
            ? await withTimeout(designQuery.eq('user_id', userId).maybeSingle(), 6000, 'loading website_designs')
            : await withTimeout(designQuery.maybeSingle(), 6000, 'loading website_designs');
          return data;
        }, { forceRefresh: opts?.silent === false });
        if (designData) {
          setSiteSettings({ siteName: designData.site_name || 'Mon Site', siteDescription: '', logo: designData.logo, primaryColor: designData.primary_color, secondaryColor: designData.secondary_color });
        } else {
          const saved = localStorage.getItem('websiteSettings');
          if (saved) setSiteSettings(JSON.parse(saved));
        }
      } catch { /* silent */ }

      try {
        const now = new Date().toISOString();
        const eventsData = await fetchWithCache(CACHE_KEYS.EVENTS, async () => {
          const { data, error } = await withTimeout(
            supabase.from('events').select('*, artist:centralized_artists(id, name, image)').eq('status', 'confirmed').gte('start_date', now).order('start_date', { ascending: true }).limit(6),
            8000, 'loading events'
          );
          if (error) throw error;
          return data || [];
        }, { forceRefresh: opts?.silent === false });
        setEvents(eventsData);
      } catch { setEvents([]); }

      try {
        const artistsData = await fetchWithCache(CACHE_KEYS.ARTISTS, async () => {
          const { data, error } = await withTimeout(supabase.from('centralized_artists').select('*').eq('is_touring', true).limit(6), 8000, 'loading artists');
          if (error) throw error;
          return data || [];
        }, { forceRefresh: opts?.silent === false });
        if (artistsData.length) setArtists(artistsData);
        else {
          const saved = localStorage.getItem('backoffice_artists');
          if (saved) setArtists(JSON.parse(saved).slice(0, 6) || []);
          else setArtists([]);
        }
      } catch { setArtists([]); }

      try { await withTimeout(loadHomePage(userId), 8000, 'loading homepage'); }
      catch { setHomePageBlocks([]); await loadHomePage(undefined); }
    } catch { await loadHomePage(undefined); }
    finally {
      if (watchdogId) window.clearTimeout(watchdogId);
      if (!opts?.silent) setLoading(false);
    }
  };

  const loadHomePage = async (userId?: string) => {
    try {
      const { data: supabaseHomePage } = await supabase
        .from('website_pages').select('*')
        .or('slug.eq./,slug.eq.home,slug.eq.accueil,slug.eq.')
        .eq('status', 'published').limit(1).maybeSingle();
      if (supabaseHomePage?.content) {
        let blocks: any[] = [];
        const raw = supabaseHomePage.content as any;
        if (typeof raw === 'string') { try { const p = JSON.parse(raw); blocks = Array.isArray(p) ? p : (p?.blocks || []); } catch { blocks = []; } }
        else if (Array.isArray(raw)) blocks = raw;
        else if (raw?.blocks) blocks = raw.blocks;
        if (blocks.length > 0) { setHomePageBlocks(blocks); return; }
      }
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const parsed = JSON.parse(savedPages);
        const pages: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : Array.isArray(parsed?.pages) ? parsed.pages : [];
        const homePage = pages.find((p: any) => p?.slug === '/' || p?.slug === 'home' || p?.slug === 'accueil' || p?.slug === '');
        let blocks: any[] = [];
        if (homePage?.content) { blocks = Array.isArray(homePage.content) ? homePage.content : (homePage.content?.blocks || []); }
        else if (Array.isArray(homePage?.blocks)) blocks = homePage.blocks;
        if (blocks.length > 0) { setHomePageBlocks(blocks); return; }
      }
    } catch { /* silent */ }
    setHomePageBlocks([
      { id: 'hero-1', type: 'hero', content: { title: 'Fatras', subtitle: 'Spectacle de rue & de scène', buttonText: 'Découvrir nos Spectacles', buttonLink: '#spectacles' } },
      { id: 'events-section', type: 'events', content: { title: 'Nos Spectacles à Venir', showAll: false } },
      { id: 'artists-section', type: 'artists', content: { title: 'Nos Spectacles', showAll: false } }
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
        title="Fatras - Spectacle de Rue Musical | Concert Théâtre & Arts de la Rue"
        description="Fatras, compagnie de spectacle de rue musical et concert-théâtre. Spectacles participatifs et interactifs pour festivals, arts de la rue. À L'Épreuve des Pavés, Live Électrique - réservez nos spectacles."
        keywords="spectacle de rue musical, spectacle musical de rue, concert théâtre, théâtre de rue musical, spectacle participatif, spectacle interactif public, spectacle arts de la rue, Fatras, festival arts de rue"
        url="https://fatras.net/"
      />
      <div className="min-h-screen">
        {Array.isArray(homePageBlocks) && homePageBlocks.length > 0 ? homePageBlocks.map((block, index) => (
          <div key={block.id || index} className="block-container">
            {block.type === 'hero' && <HeroBlock content={block.content} siteSettings={siteSettings} />}
            {(block.type === 'events' || block.type === 'events-list') && (
              <FrontEventsSection events={events} title={block.content?.title} />
            )}
            {(block.type === 'artists' || block.type === 'artists-grid') && (
              <FrontArtistsSection artists={artists} title={block.content?.title} />
            )}
            {block.type === 'text' && (
              <div className="py-8 px-4 bg-background">
                <div className="container mx-auto">
                  <div className={`text-${block.content?.alignment || 'left'} ${block.content?.size === 'small' ? 'text-sm' : block.content?.size === 'large' ? 'text-lg' : 'text-base'}`} style={{ whiteSpace: 'pre-wrap' }}>
                    {block.content?.content || 'Contenu du texte...'}
                  </div>
                </div>
              </div>
            )}
            {block.type === 'image' && block.content?.src && (
              <div className="py-8 px-4 bg-background">
                <div className="container mx-auto">
                  <div className={`text-${block.content?.alignment || 'center'}`}>
                    <OptimizedImage src={block.content.src} alt={block.content.alt || ''} className="max-w-full h-auto mx-auto rounded-lg shadow-md" />
                    {block.content.caption && <p className="text-sm text-muted-foreground mt-2">{block.content.caption}</p>}
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

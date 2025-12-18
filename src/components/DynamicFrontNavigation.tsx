
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFrontSync } from '@/hooks/useFrontSync';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
}

export const DynamicFrontNavigation: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [siteName, setSiteName] = useState('MusiConnect');
  const [logo, setLogo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  // Reset l'état d'erreur quand le logo change
  useEffect(() => {
    if (logo) setLogoError(false);
  }, [logo]);

  // Utiliser le logo directement sans cache-busting aléatoire pour éviter le clignotement
  const logoSrc = logo || '';
  
  // Utiliser le hook de synchronisation front
  const { forceSync } = useFrontSync();

  // Helper de parse sécurisé avec auto-réparation
  const safeParse = (key: string, fallback: any = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`❌ Navigation - Parse error for ${key}, auto-clearing:`, err);
      localStorage.removeItem(key);
      return fallback;
    }
  };

  // Fonction de chargement des données depuis Supabase puis localStorage fallback
  const loadAllData = React.useCallback(async () => {
    console.log('📄 Navigation - Loading data...');
    setIsLoading(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Charger le menu depuis Supabase
      const { data: menuData, error } = await supabase
        .from('website_menu')
        .select('*')
        .eq('is_visible', true)
        .order('menu_order', { ascending: true });

      if (!error && menuData && menuData.length > 0) {
        const normalized = menuData.map((item: any) => ({
          id: item.id,
          label: item.label,
          path: item.url,
          visible: item.is_visible ?? true,
          order: item.menu_order ?? 0
        }));
        
        console.log('✅ Navigation - Menu loaded from Supabase:', normalized.length, 'items');
        setMenuItems(normalized);
        localStorage.setItem('websiteMenu', JSON.stringify(menuData));
      } else {
        // Fallback vers localStorage
        loadFromLocalStorage();
      }

      // Charger le nom du site et logo depuis website_designs (Supabase en priorité)
      const { data: designData } = await supabase
        .from('website_designs')
        .select('site_name, logo')
        .limit(1)
        .maybeSingle();

      if (designData) {
        if (designData.site_name) {
          setSiteName(designData.site_name);
          console.log('✅ Navigation - Site name from Supabase:', designData.site_name);
        }
        if (designData.logo) {
          setLogo(designData.logo);
        }
      } else {
        // Fallback localStorage pour le nom/logo
        const settings = safeParse('websiteSettings') || safeParse('site_settings');
        if (settings?.siteName) setSiteName(settings.siteName);
        if (settings?.logo) setLogo(settings.logo);
        
        const design = safeParse('websiteDesign');
        if (design?.logo) setLogo(design.logo);
        if (design?.siteName) setSiteName(design.siteName);

        const config = safeParse('websiteConfig');
        if (config?.logo) setLogo(config.logo);
        if (config?.siteName) setSiteName(config.siteName);
      }
    } catch (err) {
      console.error('❌ Navigation - Error loading from Supabase:', err);
      loadFromLocalStorage();
    }
    
    setIsLoading(false);
  }, []);

  const loadFromLocalStorage = React.useCallback(() => {
    const rawMenu = safeParse('websiteMenu') || safeParse('website_menu', []);
    if (rawMenu) {
      const baseArr = Array.isArray(rawMenu)
        ? rawMenu
        : Array.isArray((rawMenu as any)?.data)
          ? (rawMenu as any).data
          : Array.isArray((rawMenu as any)?.menu)
            ? (rawMenu as any).menu
            : [];

      const clean = (s: any) => {
        if (typeof s !== 'string') return s;
        if (s.startsWith('/http://') || s.startsWith('/https://') || s.startsWith('///')) {
          return s.slice(1);
        }
        return s;
      };

      const normalized = baseArr.map((item: any) => {
        const rawPath = item.path || item.url || '/';
        const path = clean(rawPath);
        const visible = item.visible ?? item.is_visible ?? true;
        const order = item.order ?? item.menu_order ?? 0;
        return { ...item, path, visible, order } as MenuItem;
      });

      const visibleItems = normalized
        .filter((item: any) => item.visible)
        .sort((a: any, b: any) => a.order - b.order);

      // Deduplicate by label+normalized path
      const seen = new Set<string>();
      const deduped = visibleItems.filter((item: any) => {
        const label = String(item.label || '').trim().toLowerCase();
        const path = String(item.path || '')
          .replace(/\/$/, '')
          .replace(/^\/http(s)?:\/\//, 'http$1://');
        const key = `${label}|${path}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setMenuItems(deduped);
      console.log('✅ Navigation - Menu loaded from localStorage:', deduped.length, 'items');
    } else {
      setMenuItems([]);
    }
  }, []);

  // Charger les données initiales une seule fois
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Écouter uniquement les événements de storage (pas les custom events pour éviter les boucles)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if ([
        'websiteMenu',
        'website_menu',
        'websiteSettings',
        'site_settings',
        'websiteDesign',
        'websiteConfig'
      ].includes(event.key || '')) {
        setTimeout(loadAllData, 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAllData]);

  const renderMenuItem = (item: MenuItem) => {
    const urlCandidate = (item.path || (item as any).url || '') as string;
    const isExternal = urlCandidate.startsWith('http') || urlCandidate.startsWith('//');

    return (
      <div key={item.id} className="relative">
        {isExternal ? (
          <a
            href={urlCandidate}
            target="_blank"
            rel="noopener noreferrer"
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </a>
        ) : (
          <Link
            to={urlCandidate || '/'}
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </Link>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">Chargement...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className="front-header sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-theme-element="header"
      style={{
        backgroundColor: 'var(--site-header-bg, #ffffff)',
        color: 'var(--site-text-color, #1f2937)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et nom du site */}
          <Link to="/front" className="flex items-center space-x-2">
            {logo && !logoError ? (
              <img 
                key={logoSrc}
                src={logoSrc}
                alt={`${siteName} logo`}
                className="site-logo h-8 w-auto"
                style={{ maxHeight: '32px' }}
                loading="lazy"
                decoding="async"
                onError={() => {
                  console.log('❌ Navigation - Logo loading error');
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center" aria-label={`${siteName} logo fallback`}>
                <span className="text-white font-bold text-sm">
                  {siteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span 
              className="site-name font-bold text-xl"
              data-site-name
              style={{ color: 'var(--site-text-color, #1f2937)' }}
            >
              {siteName}
            </span>
          </Link>

          {/* Menu de navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map(renderMenuItem)}
          </nav>

          {/* Menu mobile avec sync */}
          <div className="md:hidden">
            <button 
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => {
                console.log('🔄 Navigation - Manual sync requested');
                forceSync();
              }}
              title="Synchroniser et actualiser"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

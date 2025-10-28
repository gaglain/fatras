
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
  
  // Reset l'état d'erreur quand le logo change et préparer un src avec version pour bust le cache
  useEffect(() => {
    if (logo) setLogoError(false);
  }, [logo]);

  const logoSrc = React.useMemo(() => {
    if (!logo) return '';
    // Ne pas ajouter de query aux Data URLs (base64)
    if (logo.startsWith('data:')) return logo;
    try {
      // Ajout de version uniquement pour fichiers/URLs afin d'éviter le cache
      if (/^(https?:)?\//.test(logo) || logo.startsWith('http')) {
        const v = Math.random().toString(36).slice(2, 10);
        const sep = logo.includes('?') ? '&' : '?';
        return `${logo}${sep}v=${v}`;
      }
      return logo;
    } catch {
      return logo;
    }
  }, [logo]);
  
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

  // Fonction de chargement des données
  const loadAllData = React.useCallback(() => {
    console.log('📄 Navigation - Loading data...');
    setIsLoading(true);
    
    // Charger le menu avec parse sécurisé
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

      // Deduplicate by label+normalized path to avoid double menu entries
      const seen = new Set<string>();
      const deduped = visibleItems.filter((item: any) => {
        const label = String(item.label || '').trim().toLowerCase();
        const path = String(item.path || '')
          .replace(/\/$/, '') // remove trailing slash
          .replace(/^\/http(s)?:\/\//, 'http$1://'); // fix accidental leading slash before http
        const key = `${label}|${path}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setMenuItems(deduped);
      console.log('✅ Navigation - Menu loaded:', deduped.length, 'items');
    } else {
      setMenuItems([]);
    }

    // Charger les paramètres avec parse sécurisé
    const settings = safeParse('websiteSettings') || safeParse('site_settings');
    if (settings?.siteName) {
      setSiteName(settings.siteName);
      console.log('⚙️ Navigation - Site name from settings:', settings.siteName);
    }
    if (settings?.logo) {
      setLogo(settings.logo);
      console.log('⚙️ Navigation - Logo from settings');
    }
    
    // Charger le design avec parse sécurisé
    const design = safeParse('websiteDesign');
    if (design?.logo) {
      setLogo(design.logo);
      console.log('🎨 Navigation - Logo loaded');
    }
    if (design?.siteName) {
      setSiteName(design.siteName);
      console.log('🎨 Navigation - Site name from design:', design.siteName);
    }

    // Charger la configuration unifiée avec parse sécurisé
    const config = safeParse('websiteConfig');
    if (config?.logo) {
      setLogo(config.logo);
      console.log('🧩 Navigation - Logo from websiteConfig');
    }
    if (config?.siteName) {
      setSiteName(config.siteName);
      console.log('🧩 Navigation - Site name from websiteConfig:', config.siteName);
    }
    
    setIsLoading(false);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    console.log('🚀 Navigation mounted');
    loadAllData();
    
    // Pas de forceSync automatique pour éviter les re-renders inutiles
  }, [loadAllData, forceSync]);

  // Écouter les événements de synchronisation
  useEffect(() => {
    const reload = () => {
      console.log('🔁 Navigation - Reloading data after update');
      setTimeout(loadAllData, 100);
    };

    const handleMenuUpdate = () => {
      console.log('🔄 Navigation - Menu update received');
      reload();
    };

    const handleSettingsUpdate = () => {
      console.log('⚙️ Navigation - Settings update received');
      reload();
    };

    const handleDesignUpdate = () => {
      console.log('🎨 Navigation - Design update received');
      reload();
    };

    const handleWebsiteConfigChanged = () => {
      console.log('🧩 Navigation - websiteConfig change detected');
      reload();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if ([
        'websiteMenu',
        'website_menu',
        'websiteSettings',
        'site_settings',
        'websiteDesign',
        'websiteConfig'
      ].includes(event.key || '')) {
        console.log('💾 Navigation - Storage change detected:', event.key);
        setTimeout(loadAllData, 200);
      }
    };

    // Event listeners
    window.addEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
    window.addEventListener('menuUpdated', handleMenuUpdate as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
    window.addEventListener('websiteConfigChanged', handleWebsiteConfigChanged as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
      window.removeEventListener('menuUpdated', handleMenuUpdate as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
      window.removeEventListener('websiteConfigChanged', handleWebsiteConfigChanged as EventListener);
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

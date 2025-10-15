
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
  
  // Utiliser le hook de synchronisation front
  const { forceSync } = useFrontSync();

  // Fonction de chargement des données
  const loadAllData = React.useCallback(() => {
    console.log('📄 Navigation - Loading data...');
    setIsLoading(true);
    
    try {
      const rawMenu = localStorage.getItem('websiteMenu') || localStorage.getItem('website_menu');
      if (rawMenu) {
        try {
          const parsed = JSON.parse(rawMenu);
          const baseArr = Array.isArray(parsed)
            ? parsed
            : Array.isArray((parsed as any)?.data)
              ? (parsed as any).data
              : Array.isArray((parsed as any)?.menu)
                ? (parsed as any).menu
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
          setMenuItems(visibleItems);
          console.log('✅ Navigation - Menu loaded:', visibleItems.length, 'items');
        } catch (e) {
          console.error('❌ Navigation - Error parsing menu:', e);
          setMenuItems([]);
        }
      } else {
        setMenuItems([]);
      }

      // Charger les paramètres (compat: websiteSettings | site_settings)
      const savedSettings = localStorage.getItem('websiteSettings') || localStorage.getItem('site_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.siteName) {
          setSiteName(settings.siteName);
          console.log('⚙️ Navigation - Site name from settings:', settings.siteName);
        }
        if (settings.logo) {
          setLogo(settings.logo);
          console.log('⚙️ Navigation - Logo from settings');
        }
      }
      
      // Charger le design
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        if (design.logo) {
          setLogo(design.logo);
          console.log('🎨 Navigation - Logo loaded');
        }
        if (design.siteName) {
          setSiteName(design.siteName);
          console.log('🎨 Navigation - Site name from design:', design.siteName);
        }
      }

      // Charger la configuration unifiée (websiteConfig)
      const savedWebsiteConfig = localStorage.getItem('websiteConfig');
      if (savedWebsiteConfig) {
        try {
          const config = JSON.parse(savedWebsiteConfig);
          if (config.logo) {
            setLogo(config.logo);
            console.log('🧩 Navigation - Logo from websiteConfig');
          }
          if (config.siteName) {
            setSiteName(config.siteName);
            console.log('🧩 Navigation - Site name from websiteConfig:', config.siteName);
          }
        } catch (e) {
          console.warn('⚠️ Navigation - Failed to parse websiteConfig');
        }
      }
    } catch (error) {
      console.error('❌ Navigation - Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
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
            {logo ? (
              <img 
                src={logo} 
                alt={siteName}
                className="site-logo h-8 w-auto"
                style={{ maxHeight: '32px' }}
                onError={(e) => {
                  console.log('❌ Navigation - Logo loading error');
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
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

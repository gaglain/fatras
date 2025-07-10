
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteRealTimeSync } from '@/hooks/useWebsiteRealTimeSync';

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
  
  // Utiliser le système de synchronisation en temps réel
  const { forceSync } = useWebsiteRealTimeSync();

  // Charger les données initiales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    console.log('📄 Loading navigation data');
    
    // Charger le menu
    const savedMenu = localStorage.getItem('websiteMenu');
    if (savedMenu) {
      try {
        const menu = JSON.parse(savedMenu);
        const visibleItems = menu.filter((item: MenuItem) => item.visible).sort((a: MenuItem, b: MenuItem) => a.order - b.order);
        setMenuItems(visibleItems);
        console.log('✅ Menu loaded:', visibleItems.length, 'items');
      } catch (error) {
        console.error('❌ Error loading menu:', error);
      }
    }

    // Charger les paramètres et design
    loadSiteSettings();
  };

  const loadSiteSettings = () => {
    const savedSettings = localStorage.getItem('websiteSettings');
    const savedDesign = localStorage.getItem('websiteDesign');
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.siteName) {
          setSiteName(settings.siteName);
          console.log('⚙️ Site name from settings:', settings.siteName);
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
      }
    }
    
    if (savedDesign) {
      try {
        const design = JSON.parse(savedDesign);
        if (design.logo) {
          setLogo(design.logo);
          console.log('🎨 Logo from design loaded');
        }
        if (design.siteName) {
          setSiteName(design.siteName);
          console.log('🎨 Site name from design:', design.siteName);
        }
      } catch (error) {
        console.error('❌ Error loading design:', error);
      }
    }
  };

  // Écouter les événements de synchronisation
  useEffect(() => {
    const handleMenuUpdate = (event: CustomEvent) => {
      console.log('🔄 Menu update received');
      const menu = event.detail || [];
      const visibleItems = menu.filter((item: MenuItem) => item.visible).sort((a: MenuItem, b: MenuItem) => a.order - b.order);
      setMenuItems(visibleItems);
    };

    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('⚙️ Settings update received');
      const settings = event.detail;
      if (settings?.siteName) {
        setSiteName(settings.siteName);
      }
    };

    const handleDesignUpdate = () => {
      console.log('🎨 Design update received');
      loadSiteSettings();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteMenu' || event.key === 'websiteSettings' || event.key === 'websiteDesign') {
        console.log('💾 Storage change detected:', event.key);
        setTimeout(loadAllData, 100);
      }
    };

    // Ajouter les event listeners
    window.addEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('websiteDesignUpdated', handleDesignUpdate);
    window.addEventListener('websiteDesignSaved', handleDesignUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate);
      window.removeEventListener('websiteDesignSaved', handleDesignUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    const isExternal = item.path.startsWith('http') || item.path.startsWith('//');

    return (
      <div key={item.id} className="relative">
        {isExternal ? (
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </a>
        ) : (
          <Link
            to={item.path}
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </Link>
        )}
      </div>
    );
  };

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
                  console.log('❌ Logo loading error');
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

          {/* Menu mobile */}
          <div className="md:hidden">
            <button 
              className="p-2"
              onClick={() => forceSync()}
              title="Synchroniser"
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


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
}

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  headerBg: string;
  textColor: string;
  linkColor: string;
}

export const SimpleFrontNavigation: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1 },
    { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2 },
    { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3 },
    { id: '4', label: 'Contact', path: '/front/contact', visible: true, order: 4 }
  ]);

  const [design, setDesign] = useState<SiteDesign>({
    logo: '',
    siteName: 'MusiConnect',
    primaryColor: '#1632f4',
    headerBg: '#ffffff',
    textColor: '#1f2937',
    linkColor: '#3b82f6'
  });

  useEffect(() => {
    const loadData = () => {
      console.log('🔄 SimpleFrontNavigation - AGGRESSIVE data loading');
      
      // Charger le menu
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        try {
          const menu = JSON.parse(savedMenu);
          const visibleItems = menu
            .filter((item: MenuItem) => item.visible)
            .sort((a: MenuItem, b: MenuItem) => a.order - b.order);
          setMenuItems(visibleItems);
          console.log('📋 Navigation - Menu loaded:', visibleItems.length, 'items');
        } catch (error) {
          console.error('❌ Navigation - Menu error:', error);
        }
      }

      // Charger le design avec priorité absolue
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        try {
          const designData = JSON.parse(savedDesign);
          console.log('🎨 Navigation - Design data loaded:', designData);
          setDesign(prev => ({ ...prev, ...designData }));
          console.log('🎨 Navigation - Design state updated to:', designData.siteName, designData.logo ? 'with logo' : 'no logo');
        } catch (error) {
          console.error('❌ Navigation - Design error:', error);
        }
      }

      // Charger les paramètres seulement si pas de design
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings && !savedDesign) {
        try {
          const settings = JSON.parse(savedSettings);
          setDesign(prev => ({ ...prev, siteName: settings.siteName }));
          console.log('⚙️ Navigation - Settings siteName loaded as fallback:', settings.siteName);
        } catch (error) {
          console.error('❌ Navigation - Settings error:', error);
        }
      }
    };

    // Chargement initial IMMÉDIAT
    loadData();

    // Écouter les événements de synchronisation unifiée avec PRIORITÉ
    const handleUnifiedSync = (event: CustomEvent) => {
      console.log('🔄 Navigation - UNIFIED SYNC EVENT received with data:', event.detail);
      const { settings, design: newDesign, siteName, forceUpdate } = event.detail;
      
      if (newDesign) {
        console.log('🎨 Navigation - Applying design from unified sync:', newDesign.siteName, newDesign.logo ? 'with logo' : 'no logo');
        setDesign(prev => {
          const updated = { ...prev, ...newDesign };
          console.log('🎨 Navigation - Design state will be updated to:', updated);
          return updated;
        });
      } else if (settings && settings.siteName) {
        console.log('⚙️ Navigation - Applying settings from unified sync:', settings.siteName);
        setDesign(prev => ({ ...prev, siteName: settings.siteName }));
      }

      if (forceUpdate) {
        console.log('🔄 Navigation - Force update requested, reloading data');
        setTimeout(loadData, 10);
      }
    };

    // Écouter les changements de storage avec réaction immédiate
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign', 'websiteMenu'].includes(event.key || '')) {
        console.log('💾 Navigation - Storage change detected for:', event.key);
        setTimeout(loadData, 10);
      }
    };

    // Ajouter TOUS les listeners possibles
    const eventTypes = [
      'websiteFullSync',
      'websiteDesignUpdated',
      'websiteDesignSaved',
      'websiteSettingsUpdated',
      'websiteSettingsSaved'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleUnifiedSync as EventListener);
    });
    
    window.addEventListener('storage', handleStorageChange);
    
    // Polling de sécurité pour s'assurer de la synchronisation
    const interval = setInterval(() => {
      loadData();
    }, 2000);
    
    return () => {
      clearInterval(interval);
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleUnifiedSync as EventListener);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  console.log('🎨 SimpleFrontNavigation render - Current design:', design.siteName, design.logo ? 'with logo' : 'no logo');

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full shadow-lg border-b"
      style={{
        backgroundColor: design.headerBg,
        color: design.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/front" className="flex items-center space-x-2">
            {design.logo ? (
              <img 
                src={design.logo} 
                alt={design.siteName}
                className="site-logo h-8 w-auto max-h-10"
                style={{ display: 'block', maxHeight: '40px', width: 'auto' }}
                onError={(e) => {
                  console.warn('⚠️ Navigation - Logo failed to load:', design.logo);
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('🖼️ Navigation - Logo loaded successfully:', design.logo);
                  (e.currentTarget as HTMLImageElement).style.display = 'block';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {design.siteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span 
              className="site-name font-bold text-xl"
              data-site-name
              style={{ 
                color: design.textColor,
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}
            >
              {design.siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="hover:opacity-80 transition-opacity"
                style={{ color: design.linkColor }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <button className="p-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

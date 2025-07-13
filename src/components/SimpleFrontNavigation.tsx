
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteSync } from '@/hooks/useWebsiteSync';

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

  // Utiliser le hook de synchronisation simplifié
  const { sync } = useWebsiteSync();

  useEffect(() => {
    const loadData = () => {
      console.log('🔄 SimpleFrontNavigation - Loading data');
      
      // Charger le design
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        try {
          const designData = JSON.parse(savedDesign);
          console.log('🎨 Navigation - Design loaded:', designData.siteName);
          setDesign(prev => ({ ...prev, ...designData }));
        } catch (error) {
          console.error('❌ Navigation - Design error:', error);
        }
      }

      // Charger les paramètres en fallback
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings && !savedDesign) {
        try {
          const settings = JSON.parse(savedSettings);
          setDesign(prev => ({ ...prev, siteName: settings.siteName }));
          console.log('⚙️ Navigation - Settings loaded:', settings.siteName);
        } catch (error) {
          console.error('❌ Navigation - Settings error:', error);
        }
      }
    };

    // Chargement initial
    loadData();

    // Écouter TOUS les événements de changement
    const handleChange = () => {
      console.log('💾 Navigation - Change detected, reloading...');
      loadData();
      sync(); // Force sync
    };

    // Écouter les événements storage ET custom
    window.addEventListener('storage', handleChange);
    window.addEventListener('websiteDesignUpdated', handleChange);
    window.addEventListener('websiteDesignSaved', handleChange);
    window.addEventListener('websiteSettingsUpdated', handleChange);
    
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('websiteDesignUpdated', handleChange);
      window.removeEventListener('websiteDesignSaved', handleChange);
      window.removeEventListener('websiteSettingsUpdated', handleChange);
    };
  }, [sync]);

  console.log('🎨 SimpleFrontNavigation render - Current design:', design.siteName);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full shadow-lg border-b front-header"
      data-theme-element="header"
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
                onLoad={() => {
                  console.log('🖼️ Navigation - Logo loaded successfully:', design.logo);
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
                className="hover:opacity-80 transition-opacity front-link"
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

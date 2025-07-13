
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
      // Charger le menu
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        try {
          const menu = JSON.parse(savedMenu);
          const visibleItems = menu
            .filter((item: MenuItem) => item.visible)
            .sort((a: MenuItem, b: MenuItem) => a.order - b.order);
          setMenuItems(visibleItems);
        } catch (error) {
          console.error('Erreur menu:', error);
        }
      }

      // Charger le design
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        try {
          const designData = JSON.parse(savedDesign);
          setDesign(prev => ({ ...prev, ...designData }));
        } catch (error) {
          console.error('Erreur design:', error);
        }
      }

      // Charger les paramètres pour le nom du site
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.siteName) {
            setDesign(prev => ({ ...prev, siteName: settings.siteName }));
          }
        } catch (error) {
          console.error('Erreur paramètres:', error);
        }
      }
    };

    loadData();
    
    // Rechargement périodique
    const interval = setInterval(loadData, 2000);

    return () => clearInterval(interval);
  }, []);

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
                className="h-8 w-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
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
              className="font-bold text-xl"
              style={{ color: design.textColor }}
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

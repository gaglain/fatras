
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FrontThemeToggle } from './FrontThemeToggle';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
  isCustom?: boolean;
}

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  textColor: string;
  linkColor: string;
}

const defaultNavItems = [
  { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1 },
  { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2 },
  { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3 },
  { id: '4', label: 'Boutique', path: '/front/shop', visible: true, order: 4 },
  { id: '5', label: 'Contact', path: '/front/contact', visible: true, order: 5 }
];

export const FrontNavigation: React.FC = () => {
  const location = useLocation();
  const [navItems, setNavItems] = useState<MenuItem[]>(defaultNavItems);
  const [siteDesign, setSiteDesign] = useState<SiteDesign | null>(null);

  // Fonction pour charger les paramètres
  const loadSettings = () => {
    const savedMenu = localStorage.getItem('websiteMenu');
    const savedDesign = localStorage.getItem('websiteDesign');
    
    if (savedMenu) {
      try {
        const parsedMenu = JSON.parse(savedMenu);
        setNavItems(parsedMenu);
      } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
      }
    }
    
    if (savedDesign) {
      try {
        const parsedDesign = JSON.parse(savedDesign);
        setSiteDesign(parsedDesign);
      } catch (error) {
        console.error('Erreur lors du chargement du design:', error);
      }
    }
  };

  useEffect(() => {
    // Charger au démarrage
    loadSettings();

    // Écouter les mises à jour
    const handleMenuUpdate = (event: CustomEvent) => {
      console.log('Navigation - Menu mis à jour:', event.detail);
      setNavItems(event.detail);
    };

    const handleDesignUpdate = (event: CustomEvent) => {
      console.log('Navigation - Design mis à jour:', event.detail);
      setSiteDesign(event.detail);
    };

    // Écouter les changements dans localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteMenu' || event.key === 'websiteDesign') {
        console.log('Navigation - Changement localStorage:', event.key);
        loadSettings();
      }
    };

    window.addEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
    window.addEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Séparer les éléments de contact des autres
  const mainNavItems = navItems
    .filter(item => item.visible && item.path !== '/front/contact')
    .sort((a, b) => a.order - b.order);
    
  const contactItem = navItems.find(item => item.path === '/front/contact' && item.visible);

  // Styles dynamiques basés sur le design personnalisé
  const headerStyle = siteDesign ? {
    background: siteDesign.headerBg,
    color: siteDesign.textColor
  } : {};

  const logoSrc = siteDesign?.logo || '/logo.svg';
  const siteName = siteDesign?.siteName || 'MusiConnect';

  return (
    <nav 
      className="arc-front-header fixed top-0 left-0 right-0 z-50 h-20 shadow"
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo à gauche + navigation principale */}
          <div className="flex items-center space-x-8 h-full">
            {/* Logo personnalisable */}
            <Link 
              to="/front" 
              className="arc-logo flex items-center space-x-2 font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity select-none"
              style={{ color: siteDesign?.textColor || '#ffffff' }}
            >
              <img 
                src={logoSrc} 
                alt={siteName} 
                className="h-9 w-9 object-contain" 
                style={{
                  filter: siteDesign ? 'none' : 'drop-shadow(0 2px 7px #6b21a8)'
                }} 
                onError={(e: any) => { e.currentTarget.style.display='none' }} 
              />
              <span>{siteName}</span>
            </Link>
            {/* Navigation principale */}
            <div className="hidden md:flex items-center space-x-6 h-full">
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`arc-nav-link px-4 py-2 rounded h-full flex items-center ${
                    location.pathname === item.path 
                      ? 'bg-white/10 font-bold' 
                      : 'hover:text-opacity-90'
                  }`}
                  style={{ 
                    transition: 'all 0.14s',
                    color: siteDesign?.textColor || '#ffffff'
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {/* À droite : Contact + Dark/Light */}
          <div className="flex items-center space-x-3">
            {contactItem && (
              <Link
                to={contactItem.path}
                className={`arc-nav-link px-4 py-2 rounded ${
                  location.pathname === contactItem.path 
                    ? 'bg-white/10 font-bold' 
                    : 'hover:text-opacity-90'
                }`}
                style={{ 
                  transition: 'all 0.14s',
                  color: siteDesign?.textColor || '#ffffff'
                }}
              >
                {contactItem.label}
              </Link>
            )}
            <FrontThemeToggle variant="front" />
          </div>
        </div>
      </div>
    </nav>
  );
};

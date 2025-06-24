
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

  useEffect(() => {
    // Charger le menu personnalisé
    const loadMenu = () => {
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        try {
          const parsedMenu = JSON.parse(savedMenu);
          setNavItems(parsedMenu);
        } catch (error) {
          console.error('Erreur lors du chargement du menu:', error);
        }
      }
    };

    // Charger au démarrage
    loadMenu();

    // Écouter les mises à jour du menu
    const handleMenuUpdate = (event: CustomEvent) => {
      setNavItems(event.detail);
    };

    window.addEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);

    return () => {
      window.removeEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
    };
  }, []);

  // Séparer les éléments de contact des autres
  const mainNavItems = navItems
    .filter(item => item.visible && item.path !== '/front/contact')
    .sort((a, b) => a.order - b.order);
    
  const contactItem = navItems.find(item => item.path === '/front/contact' && item.visible);

  return (
    <nav className="arc-front-header fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-r from-background via-[#1a1f2e] to-[#222c45] shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo à gauche + navigation principale */}
          <div className="flex items-center space-x-8 h-full">
            {/* Logo personnalisable */}
            <Link to="/front" className="arc-logo flex items-center space-x-2 text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity select-none">
              {/* Image ou texte logo, modifiable facilement : */}
              <img src="/logo.svg" alt="MusiConnect" className="h-9 w-9 object-contain" style={{filter: 'drop-shadow(0 2px 7px #6b21a8)'}} onError={(e: any) => { e.currentTarget.style.display='none' }} />
              <span>MusiConnect</span>
            </Link>
            {/* Navigation principale */}
            <div className="hidden md:flex items-center space-x-6 h-full">
              {mainNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`arc-nav-link px-4 py-2 rounded h-full flex items-center ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/10 font-bold' 
                      : 'text-white/90 hover:text-white'
                  }`}
                  style={{ transition: 'all 0.14s' }}
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
                    ? 'text-white bg-white/10 font-bold' 
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ transition: 'all 0.14s' }}
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

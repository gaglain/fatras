
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FrontThemeToggle } from './FrontThemeToggle';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
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

export const FrontNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: 'MusiConnect',
    siteDescription: 'Plateforme de gestion artistique',
    contactEmail: 'contact@musiconnect.com',
    contactPhone: '+33 1 23 45 67 89',
    address: '123 Rue de la Musique, 75001 Paris',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: ''
    }
  });

  const [design, setDesign] = useState<SiteDesign>({
    logo: '/logo.svg',
    siteName: 'MusiConnect',
    primaryColor: '#1632f4',
    secondaryColor: '#ec5f65',
    accentColor: '#f19e9c',
    headerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
    footerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
    textColor: '#ffffff',
    linkColor: '#60a5fa'
  });

  const location = useLocation();

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Erreur chargement paramètres:', error);
        }
      }
    };

    const loadDesign = () => {
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        try {
          const parsed = JSON.parse(savedDesign);
          setDesign(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Erreur chargement design:', error);
        }
      }
    };

    loadSettings();
    loadDesign();

    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 Navigation - Mise à jour des paramètres:', event.detail);
      setSettings(prev => ({ ...prev, ...event.detail }));
    };

    const handleDesignUpdate = (event: CustomEvent) => {
      console.log('🎨 Navigation - Mise à jour du design:', event.detail);
      setDesign(prev => ({ ...prev, ...event.detail }));
    };

    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
    window.addEventListener('storage', () => {
      loadSettings();
      loadDesign();
    });

    // Polling pour s'assurer de la synchronisation
    const interval = setInterval(() => {
      loadSettings();
      loadDesign();
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
    };
  }, []);

  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Artistes', path: '/artistes' },
    { name: 'Événements', path: '/evenements' },
    { name: 'Boutique', path: '/boutique' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav 
      className="front-header fixed top-0 left-0 right-0 z-50 w-full shadow-lg"
      data-theme-element="header"
      style={{
        background: design.headerBg,
        color: design.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom */}
          <div className="flex items-center space-x-3">
            {design.logo && (
              <img
                src={design.logo}
                alt="Logo"
                className="site-logo h-10 w-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <Link 
              to="/" 
              className="site-name font-bold text-xl hover:opacity-80 transition-opacity"
              data-site-name
              style={{ color: design.textColor }}
            >
              {design.siteName || settings.siteName}
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`front-link hover:opacity-80 transition-opacity ${
                  location.pathname === item.path ? 'font-semibold' : ''
                }`}
                style={{ color: design.linkColor }}
              >
                {item.name}
              </Link>
            ))}
            <FrontThemeToggle />
          </div>

          {/* Menu mobile button */}
          <div className="md:hidden flex items-center space-x-2">
            <FrontThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: design.textColor }}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-600">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`front-link block py-2 px-3 rounded hover:bg-gray-700 transition-colors ${
                    location.pathname === item.path ? 'font-semibold' : ''
                  }`}
                  style={{ color: design.linkColor }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

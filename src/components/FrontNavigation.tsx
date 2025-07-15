
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
  const [siteName, setSiteName] = useState('MusiConnect');
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

  // FONCTION DE CHARGEMENT UNIFIÉE ET AGRESSIVE
  const loadSiteData = () => {
    console.log('🔍 FrontNavigation - Loading site data...');
    
    try {
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('✅ FrontNavigation - Design found:', design);
        
        if (design.siteName) {
          setSiteName(design.siteName);
          setDesign(prev => ({ ...prev, ...design }));
          document.title = design.siteName;
          console.log('🎯 FrontNavigation - Applied siteName:', design.siteName);
          return;
        }
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 FrontNavigation - Settings fallback:', settings);
        
        if (settings.siteName) {
          setSiteName(settings.siteName);
          document.title = settings.siteName;
          console.log('🎯 FrontNavigation - Applied siteName from settings:', settings.siteName);
        }
      }

    } catch (error) {
      console.error('❌ FrontNavigation - Error loading data:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 FrontNavigation - Initializing...');
    
    // Chargement immédiat
    loadSiteData();

    const handleUpdate = () => {
      console.log('📡 FrontNavigation - Event received, reloading...');
      setTimeout(loadSiteData, 10);
    };

    // Écouter TOUS les événements
    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('websiteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling agressif toutes les secondes
    const interval = setInterval(loadSiteData, 1000);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
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
              key={`site-name-${siteName}-${Date.now()}`}
            >
              {siteName}
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


import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleFrontNavigationProps {
  siteName?: string;
}

export const SimpleFrontNavigation: React.FC<SimpleFrontNavigationProps> = ({ siteName: propSiteName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState(propSiteName || 'MusiConnect');
  const [logo, setLogo] = useState('');
  const location = useLocation();

  // FONCTION DE CHARGEMENT UNIFIÉE ET AGRESSIVE
  const loadSiteData = () => {
    console.log('🔍 SimpleFrontNavigation - Loading site data...');
    
    try {
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('✅ SimpleFrontNavigation - Design found:', design);
        
        if (design.siteName) {
          setSiteName(design.siteName);
          document.title = design.siteName;
          console.log('🎯 SimpleFrontNavigation - Applied siteName:', design.siteName);
        }
        if (design.logo) {
          setLogo(design.logo);
          console.log('🎨 SimpleFrontNavigation - Applied logo');
        }
        return;
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 SimpleFrontNavigation - Settings fallback:', settings);
        
        if (settings.siteName) {
          setSiteName(settings.siteName);
          document.title = settings.siteName;
          console.log('🎯 SimpleFrontNavigation - Applied siteName from settings:', settings.siteName);
        }
      }

    } catch (error) {
      console.error('❌ SimpleFrontNavigation - Error loading data:', error);
    }
  };

  // Utiliser le prop si fourni
  useEffect(() => {
    if (propSiteName) {
      setSiteName(propSiteName);
      console.log('🎯 SimpleFrontNavigation - Using prop siteName:', propSiteName);
    }
  }, [propSiteName]);

  useEffect(() => {
    console.log('🚀 SimpleFrontNavigation - Initializing...');
    
    // Chargement immédiat
    loadSiteData();

    const handleUpdate = () => {
      console.log('📡 SimpleFrontNavigation - Event received, reloading...');
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
    { name: 'Accueil', path: '/front' },
    { name: 'Artistes', path: '/front/artists' },
    { name: 'Événements', path: '/front/events' },
    { name: 'Boutique', path: '/front/shop' },
    { name: 'Contact', path: '/front/contact' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et nom */}
          <div className="flex items-center">
            <Link to="/front" className="flex items-center space-x-3">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  className="site-logo h-10 w-auto"
                  onError={(e) => {
                    console.log('❌ SimpleFrontNavigation - Logo loading error');
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {siteName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span 
                className="site-name text-xl font-bold text-gray-900"
                data-site-name
                key={`site-name-${siteName}-${Date.now()}`}
              >
                {siteName}
              </span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`front-link text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile ouvert */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`front-link block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors ${
                    location.pathname === item.path ? 'text-blue-600 font-semibold bg-blue-50' : ''
                  }`}
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

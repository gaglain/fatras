
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FrontThemeToggle } from './FrontThemeToggle';
import { supabase } from '@/integrations/supabase/client';

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

const defaultDesign: SiteDesign = {
  logo: '/logo.svg',
  siteName: 'MusiConnect',
  primaryColor: '#1632f4',
  secondaryColor: '#ec5f65',
  accentColor: '#f19e9c',
  headerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  footerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  textColor: '#ffffff',
  linkColor: '#60a5fa'
};

export const FrontNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('MusiConnect');
  const [design, setDesign] = useState<SiteDesign>(defaultDesign);
  const location = useLocation();

  // Charger depuis Supabase puis localStorage
  const loadSiteData = async () => {
    try {
      // D'abord essayer Supabase (données prioritaires)
      const { data: designData } = await supabase
        .from('website_designs')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (designData) {
        const newDesign: SiteDesign = {
          logo: designData.logo || defaultDesign.logo,
          siteName: designData.site_name || defaultDesign.siteName,
          primaryColor: designData.primary_color || defaultDesign.primaryColor,
          secondaryColor: designData.secondary_color || defaultDesign.secondaryColor,
          accentColor: designData.accent_color || defaultDesign.accentColor,
          headerBg: designData.header_bg || defaultDesign.headerBg,
          footerBg: designData.footer_bg || defaultDesign.footerBg,
          textColor: designData.text_color || defaultDesign.textColor,
          linkColor: designData.link_color || defaultDesign.linkColor
        };
        
        setSiteName(newDesign.siteName);
        setDesign(newDesign);
        document.title = newDesign.siteName;
        
        // Mettre à jour localStorage pour la cohérence
        localStorage.setItem('websiteDesign', JSON.stringify({
          siteName: newDesign.siteName,
          logo: newDesign.logo,
          primaryColor: newDesign.primaryColor,
          secondaryColor: newDesign.secondaryColor,
          headerBg: newDesign.headerBg,
          textColor: newDesign.textColor,
          linkColor: newDesign.linkColor
        }));
        return;
      }
    } catch (error) {
      console.error('Erreur chargement Supabase:', error);
    }

    // Fallback localStorage
    try {
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const parsed = JSON.parse(savedDesign);
        if (parsed.siteName) {
          setSiteName(parsed.siteName);
          setDesign(prev => ({ ...prev, ...parsed }));
          document.title = parsed.siteName;
        }
      }
    } catch (error) {
      console.error('Erreur localStorage:', error);
    }
  };

  useEffect(() => {
    loadSiteData();

    const handleUpdate = () => {
      setTimeout(loadSiteData, 100);
    };

    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling réduit à 10 secondes (les données viennent de Supabase maintenant)
    const interval = setInterval(loadSiteData, 10000);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
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


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
  const [menuItems] = useState<MenuItem[]>([
    { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1 },
    { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2 },
    { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3 },
    { id: '4', label: 'Contact', path: '/front/contact', visible: true, order: 4 }
  ]);

  const [design, setDesign] = useState<SiteDesign>({
    logo: '',
    siteName: 'MusiConnect', // valeur par défaut
    primaryColor: '#1632f4',
    headerBg: '#ffffff',
    textColor: '#1f2937',
    linkColor: '#3b82f6'
  });

  useEffect(() => {
    console.log('🔥 NAVIGATION - Starting SUPER AGGRESSIVE sync');
    
    const loadAndApplyData = () => {
      // Charger le design en priorité ABSOLUE
      const savedDesign = localStorage.getItem('websiteDesign');
      const savedSettings = localStorage.getItem('websiteSettings');
      
      let newSiteName = 'MusiConnect';
      let newDesign = {
        logo: '',
        siteName: 'MusiConnect',
        primaryColor: '#1632f4',
        headerBg: '#ffffff',
        textColor: '#1f2937',
        linkColor: '#3b82f6'
      };
      
      // PRIORITÉ ABSOLUE au design
      if (savedDesign) {
        try {
          const designData = JSON.parse(savedDesign);
          newDesign = { ...newDesign, ...designData };
          if (designData.siteName) {
            newSiteName = designData.siteName;
            console.log('🔥 NAVIGATION - Design loaded with siteName:', newSiteName);
          }
        } catch (error) {
          console.error('❌ Design parse error:', error);
        }
      }
      
      // Fallback vers settings SEULEMENT si pas de siteName dans design
      if (!newSiteName || newSiteName === 'MusiConnect') {
        if (savedSettings) {
          try {
            const settingsData = JSON.parse(savedSettings);
            if (settingsData.siteName) {
              newSiteName = settingsData.siteName;
              console.log('🔥 NAVIGATION - Settings fallback loaded:', newSiteName);
            }
          } catch (error) {
            console.error('❌ Settings parse error:', error);
          }
        }
      }
      
      // FORCER la mise à jour immédiate
      const finalDesign = { ...newDesign, siteName: newSiteName };
      setDesign(finalDesign);
      
      // FORCER le titre de la page
      if (document.title !== newSiteName) {
        document.title = newSiteName;
        console.log('📄 NAVIGATION - Title FORCED to:', newSiteName);
      }
      
      console.log('🔥 NAVIGATION - Applied siteName:', newSiteName);
      console.log('🔥 NAVIGATION - Full design:', finalDesign);
    };

    // Charger immédiatement ET de manière répétée
    loadAndApplyData();
    setTimeout(loadAndApplyData, 50);
    setTimeout(loadAndApplyData, 200);
    setTimeout(loadAndApplyData, 500);
    
    // Écouter tous les changements possibles
    const handleDataChange = (event?: any) => {
      console.log('📡 NAVIGATION - Data change detected:', event?.type || 'manual');
      setTimeout(loadAndApplyData, 10); // Très rapide
    };

    window.addEventListener('storage', handleDataChange);
    window.addEventListener('websiteDesignUpdated', handleDataChange);
    window.addEventListener('websiteDesignSaved', handleDataChange);
    window.addEventListener('websiteSettingsUpdated', handleDataChange);
    
    // Vérification périodique très agressive
    const aggressiveInterval = setInterval(loadAndApplyData, 1000); // Toutes les secondes
    
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('websiteDesignUpdated', handleDataChange);
      window.removeEventListener('websiteDesignSaved', handleDataChange);
      window.removeEventListener('websiteSettingsUpdated', handleDataChange);
      clearInterval(aggressiveInterval);
    };
  }, []);

  console.log('🎨 Navigation render - Current design:', design.siteName);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full shadow-lg border-b front-header"
      data-theme-element="header"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/front" className="flex items-center space-x-2">
            {design.logo ? (
              <img 
                src={design.logo} 
                alt={design.siteName}
                className="site-logo"
                onError={(e) => {
                  console.warn('⚠️ Logo failed to load:', design.logo);
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log('🖼️ Logo loaded successfully');
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
              key={design.siteName} // Forcer le re-render quand le nom change
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
                data-theme-element="link"
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


import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FrontNavigation } from './FrontNavigation';
import { SiteCustomizer } from './SiteCustomizer';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface FrontLayoutProps {
  children?: React.ReactNode;
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

export const FrontLayout: React.FC<FrontLayoutProps> = ({ children }) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [siteDesign, setSiteDesign] = useState<SiteDesign | null>(null);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    // Charger le design et les paramètres
    const loadSettings = () => {
      const savedDesign = localStorage.getItem('websiteDesign');
      const savedSettings = localStorage.getItem('websiteSettings');
      
      if (savedDesign) {
        try {
          setSiteDesign(JSON.parse(savedDesign));
        } catch (error) {
          console.error('Erreur lors du chargement du design:', error);
        }
      }
      
      if (savedSettings) {
        try {
          setWebsiteSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
    };

    loadSettings();

    // Écouter les mises à jour
    const handleDesignUpdate = (event: CustomEvent<SiteDesign>) => {
      setSiteDesign(event.detail);
    };

    const handleSettingsUpdate = (event: CustomEvent<WebsiteSettings>) => {
      setWebsiteSettings(event.detail);
    };

    window.addEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  // Styles dynamiques pour le footer
  const footerStyle = siteDesign ? {
    background: siteDesign.footerBg,
    color: siteDesign.textColor
  } : {};

  const siteName = websiteSettings?.siteName ?? siteDesign?.siteName ?? 'MusiConnect';
  const contactEmail = websiteSettings?.contactEmail ?? 'contact@musiconnect.com';
  const contactPhone = websiteSettings?.contactPhone ?? '+33 1 23 45 67 89';
  const socialLinks = websiteSettings?.socialLinks ?? {};

  return (
    <HelmetProvider>
      <div className="min-h-screen arc-front-bg">
        <FrontNavigation />
        
        {/* Bouton de personnalisation flottant */}
        <Button
          onClick={() => setShowCustomizer(true)}
          className="fixed bottom-6 right-6 z-40 rounded-full w-12 h-12 p-0 arc-button shadow-lg"
          title="Personnaliser les couleurs"
        >
          <Palette className="h-5 w-5" />
        </Button>

        <main className="flex-1 pt-20">
          {children || <Outlet />}
        </main>
        
        <footer 
          className="arc-footer py-12 mt-16 relative overflow-hidden"
          style={footerStyle}
        >
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.1) 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }}
            ></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold arc-text-primary">
                  {siteName}
                </h3>
                <p className="arc-text-secondary leading-relaxed">
                  {websiteSettings?.siteDescription ?? 'Votre plateforme de gestion musicale complète.'}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold arc-text-primary">Liens rapides</h3>
                <ul className="space-y-3 arc-text-secondary">
                  <li><a href="/front" className="hover:opacity-80 transition-opacity duration-300">Accueil</a></li>
                  <li><a href="/front/artists" className="hover:opacity-80 transition-opacity duration-300">Artistes</a></li>
                  <li><a href="/front/events" className="hover:opacity-80 transition-opacity duration-300">Événements</a></li>
                  <li><a href="/front/contact" className="hover:opacity-80 transition-opacity duration-300">Contact</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold arc-text-primary">Contact</h3>
                <div className="arc-text-secondary space-y-2">
                  <p>Email: {contactEmail}</p>
                  <p>Téléphone: {contactPhone}</p>
                  {websiteSettings?.address && <p>Adresse: {websiteSettings.address}</p>}
                </div>
                
                {/* Liens sociaux */}
                {Object.entries(socialLinks).some(([_, url]) => url) && (
                  <div className="flex space-x-4 mt-4">
                    {Object.entries(socialLinks).map(([platform, url]) => 
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity duration-300"
                          title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-opacity-50 mt-12 pt-8 text-center arc-text-secondary" style={{ borderColor: siteDesign?.textColor ?? '#ffffff' }}>
              <p>&copy; 2024 {siteName}. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        <SiteCustomizer 
          isOpen={showCustomizer} 
          onClose={() => setShowCustomizer(false)} 
        />
      </div>
    </HelmetProvider>
  );
};

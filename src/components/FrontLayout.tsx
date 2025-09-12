
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DynamicFrontNavigation } from './DynamicFrontNavigation';
import { useFrontSync } from '@/hooks/useFrontSync';
import { useFrontDataSync } from '@/hooks/useFrontDataSync';
import { PublicChatWidget } from './PublicChatWidget';
import { RGPDModule } from './RGPDModule';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

interface FrontLayoutProps {
  children?: React.ReactNode;
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
  googleAnalyticsId?: string;
}

export const FrontLayout: React.FC<FrontLayoutProps> = ({ children }) => {
  // Utiliser les hooks de synchronisation front
  const { forceSync } = useFrontSync();
  const { forceSync: forceFrontDataSync } = useFrontDataSync();
  
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

  useEffect(() => {
    console.log('🎯 FrontLayout mounted - Starting sync');
    
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          console.log('⚙️ FrontLayout - Settings loaded:', parsed.siteName);
          setSettings(prev => ({ ...prev, ...parsed }));
          
          // Mettre à jour le titre de la page
          if (parsed.siteName) {
            document.title = parsed.siteName;
          }
        } catch (error) {
          console.error('❌ FrontLayout - Error loading settings:', error);
        }
      }
    };

    // Chargement initial
    loadSettings();
    
    // Force sync après un délai pour s'assurer que tout est chargé
    setTimeout(() => {
      console.log('🔄 FrontLayout - Force sync after mount');
      forceSync();
      forceFrontDataSync();
      loadSettings(); // Recharger après le force sync
    }, 500);

    // Polling plus fréquent pour s'assurer de la synchronisation
    const pollInterval = setInterval(() => {
      loadSettings();
    }, 2000);

    const handleSettingsUpdate = (event: any) => {
      console.log('🔄 FrontLayout - Settings update detected:', event.detail || 'Custom event');
      setTimeout(loadSettings, 100); // Petit délai pour s'assurer que localStorage est à jour
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings' || event.key === 'websiteDesign') {
        console.log('💾 FrontLayout - Storage change detected for:', event.key);
        setTimeout(loadSettings, 100);
      }
    };

    // Écouter tous les types d'événements possibles
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('websiteDesignUpdated', handleSettingsUpdate);
    window.addEventListener('websiteSettingsSaved', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('websiteDesignUpdated', handleSettingsUpdate);
      window.removeEventListener('websiteSettingsSaved', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [forceSync, forceFrontDataSync]);

  return (
    <div className="min-h-screen flex flex-col" data-theme-element="page">
      {/* Google Analytics */}
      <GoogleAnalytics measurementId={settings.googleAnalyticsId} />
      
      {/* Navigation dynamique synchronisée */}
      <DynamicFrontNavigation />
      
      {/* Main Content */}
      <main className="flex-1" data-theme-element="main">
        {children || <Outlet />}
      </main>
      
      {/* Footer */}
      <footer 
        className="front-footer py-8 px-4 mt-auto"
        data-theme-element="footer"
        style={{
          backgroundColor: 'var(--site-footer-bg, #1f2937)',
          color: 'var(--site-text-color, #ffffff)'
        }}
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h3 
                className="font-semibold mb-4 text-lg"
                style={{ color: 'var(--site-text-color, #ffffff)' }}
              >
                Contact
              </h3>
              <div className="space-y-2 text-sm">
                <p style={{ color: 'var(--site-text-color, #e5e7eb)' }}>
                  {settings.contactEmail}
                </p>
                <p style={{ color: 'var(--site-text-color, #e5e7eb)' }}>
                  {settings.contactPhone}
                </p>
                <p style={{ color: 'var(--site-text-color, #e5e7eb)' }}>
                  {settings.address}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 
                className="font-semibold mb-4 text-lg"
                style={{ color: 'var(--site-text-color, #ffffff)' }}
              >
                Suivez-nous
              </h3>
              <div className="flex space-x-4">
                {settings.socialLinks.facebook && (
                  <a 
                    href={settings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80 hover:scale-110 transition-transform"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                    title="Facebook"
                  >
                    <Facebook size={24} />
                  </a>
                )}
                {settings.socialLinks.instagram && (
                  <a 
                    href={settings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80 hover:scale-110 transition-transform"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                    title="Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                )}
                {settings.socialLinks.twitter && (
                  <a 
                    href={settings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80 hover:scale-110 transition-transform"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                    title="Twitter"
                  >
                    <Twitter size={24} />
                  </a>
                )}
                {settings.socialLinks.youtube && (
                  <a 
                    href={settings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80 hover:scale-110 transition-transform"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                    title="YouTube"
                  >
                    <Youtube size={24} />
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a 
                    href={settings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80 hover:scale-110 transition-transform"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                    title="LinkedIn"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h3 
                className="font-semibold mb-4 text-lg"
                style={{ color: 'var(--site-text-color, #ffffff)' }}
              >
                Informations légales
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <a 
                    href="/mentions-legales"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Mentions légales
                  </a>
                </div>
                <div>
                  <a 
                    href="/cgv"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Conditions générales de vente
                  </a>
                </div>
                <div>
                  <a 
                    href="/politique-confidentialite"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Politique de confidentialité
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
            <p style={{ color: 'var(--site-text-color, #9ca3af)' }}>
              © 2024 {settings.siteName}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <PublicChatWidget />
      
      {/* RGPD Module */}
      <RGPDModule />
    </div>
  );
};

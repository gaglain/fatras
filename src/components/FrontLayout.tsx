
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DynamicFrontNavigation } from './DynamicFrontNavigation';
import { useWebsiteSync } from '@/hooks/useWebsiteSync';
import { PublicChatWidget } from './PublicChatWidget';
import { RGPDModule } from './RGPDModule';
import { GoogleAnalytics } from './GoogleAnalytics';

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
  useWebsiteSync();
  
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

    loadSettings();

    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 Layout - Mise à jour des paramètres détectée:', event.detail);
      setSettings(prev => ({ ...prev, ...event.detail }));
    };

    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('storage', loadSettings);

    return () => {
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

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
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Facebook
                  </a>
                )}
                {settings.socialLinks.instagram && (
                  <a 
                    href={settings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Instagram
                  </a>
                )}
                {settings.socialLinks.twitter && (
                  <a 
                    href={settings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Twitter
                  </a>
                )}
                {settings.socialLinks.youtube && (
                  <a 
                    href={settings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    YouTube
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a 
                    href={settings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    LinkedIn
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

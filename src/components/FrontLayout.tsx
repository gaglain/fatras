import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DynamicFrontNavigation } from './DynamicFrontNavigation';
import { PublicChatWidget } from './PublicChatWidget';
import { RGPDModule } from './RGPDModule';
import { GoogleAnalytics } from './GoogleAnalytics';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    
    const loadSettings = async () => {
      try {
        // Identifier l'utilisateur courant (si connecté) afin de charger LES bons paramètres
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        // Charger depuis Supabase en priorité
        const designQuery = supabase.from('website_designs').select('*').limit(1);
        const { data: designData } = userId
          ? await designQuery.eq('user_id', userId).maybeSingle()
          : await designQuery.maybeSingle();
        
        // Charger websiteConfig qui contient toutes les infos y compris socialLinks
        const settingsQuery = supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', [
            'websiteConfig',
            'contact_email',
            'contact_phone',
            'address',
            'google_analytics_id'
          ]);
        const { data: appSettings } = userId
          ? await settingsQuery.eq('user_id', userId)
          : await settingsQuery;

        let merged: WebsiteSettings = { ...settings };
        
        if (designData) {
          merged.siteName = designData.site_name || merged.siteName;
          merged.siteDescription = merged.siteDescription;
          console.log('📦 Loaded site name from Supabase:', designData.site_name);
        }
        
        if (appSettings) {
          const settingsMap = Object.fromEntries(
            appSettings.map(s => [s.setting_key, s.setting_value])
          );
          
          // Priorité au websiteConfig qui contient tout
          if (settingsMap['websiteConfig']) {
            try {
              const config = JSON.parse(settingsMap['websiteConfig']);
              merged.contactEmail = config.contactEmail || merged.contactEmail;
              merged.contactPhone = config.contactPhone || merged.contactPhone;
              merged.address = config.address || merged.address;
              merged.googleAnalyticsId = config.googleAnalyticsId || merged.googleAnalyticsId;
              merged.socialLinks = config.socialLinks || merged.socialLinks;
              console.log('📦 Loaded settings from websiteConfig:', config.socialLinks);
            } catch (e) {
              console.error('❌ Error parsing websiteConfig:', e);
            }
          } else {
            // Fallback sur les clés individuelles
            merged.contactEmail = settingsMap['contact_email'] || merged.contactEmail;
            merged.contactPhone = settingsMap['contact_phone'] || merged.contactPhone;
            merged.address = settingsMap['address'] || merged.address;
            merged.googleAnalyticsId = settingsMap['google_analytics_id'];
          }
        }

        // Fallback sur localStorage si rien en base
        if (!designData) {
          const savedWebsiteSettings = localStorage.getItem('websiteSettings');
          if (savedWebsiteSettings) {
            const parsed = JSON.parse(savedWebsiteSettings);
            merged = { ...merged, ...parsed };
          }
        }

        setSettings(merged);
        if (merged.siteName) document.title = merged.siteName;
      } catch (error) {
        console.error('❌ FrontLayout - Error loading settings:', error);
      }
    };

    // Chargement initial unique
    loadSettings();

    const handleSettingsUpdate = () => {
      console.log('🔄 FrontLayout - Settings update detected');
      loadSettings();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings' || event.key === 'websiteDesign' || event.key === 'site_settings' || event.key === 'websiteConfig') {
        console.log('💾 FrontLayout - Storage change detected for:', event.key);
        loadSettings();
      }
    };

    // Écouter les événements de mise à jour (sans polling)
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('websiteDesignUpdated', handleSettingsUpdate);
    window.addEventListener('websiteSettingsSaved', handleSettingsUpdate);
    window.addEventListener('websiteConfigChanged', handleSettingsUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('websiteDesignUpdated', handleSettingsUpdate);
      window.removeEventListener('websiteSettingsSaved', handleSettingsUpdate);
      window.removeEventListener('websiteConfigChanged', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  <Link 
                    to="/front/mentions-legales"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Mentions légales
                  </Link>
                </div>
                <div>
                  <Link 
                    to="/front/cgv"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Conditions générales de vente
                  </Link>
                </div>
                <div>
                  <Link 
                    to="/front/politique-confidentialite"
                    className="front-link hover:opacity-80"
                    style={{ color: 'var(--site-link-color, #3b82f6)' }}
                  >
                    Politique de confidentialité
                  </Link>
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


import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';

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

export const SimpleFrontLayout: React.FC = () => {
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
          if (parsed.siteName) {
            document.title = parsed.siteName;
          }
        } catch (error) {
          console.error('Erreur chargement paramètres:', error);
        }
      }
    };

    loadSettings();
    
    // Rechargement périodique simple
    const interval = setInterval(loadSettings, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleFrontNavigation />
      
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-8 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Contact</h3>
              <div className="space-y-2 text-sm">
                <p>{settings.contactEmail}</p>
                <p>{settings.contactPhone}</p>
                <p>{settings.address}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Suivez-nous</h3>
              <div className="flex space-x-4">
                {settings.socialLinks.facebook && (
                  <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    Facebook
                  </a>
                )}
                {settings.socialLinks.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
                    Instagram
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Informations légales</h3>
              <div className="space-y-2 text-sm">
                <div><a href="/mentions-legales" className="text-blue-400 hover:text-blue-300">Mentions légales</a></div>
                <div><a href="/cgv" className="text-blue-400 hover:text-blue-300">CGV</a></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
            <p>© 2024 {settings.siteName}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


import React, { useEffect, useState } from 'react';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
}

export const SimpleFrontHome: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: 'MusiConnect',
    siteDescription: 'Plateforme de gestion artistique'
  });

  useEffect(() => {
    console.log('🚀 SIMPLE FRONT HOME - Loading');
    
    const loadSiteData = () => {
      const savedSettings = localStorage.getItem('websiteSettings');
      const savedDesign = localStorage.getItem('websiteDesign');
      
      let finalSiteName = 'MusiConnect';
      let finalDescription = 'Plateforme de gestion artistique';
      
      // Priorité au design
      if (savedDesign) {
        try {
          const design = JSON.parse(savedDesign);
          if (design.siteName) finalSiteName = design.siteName;
          console.log('🚀 SIMPLE FRONT HOME - Design loaded:', design.siteName);
        } catch (error) {
          console.error('Design parse error:', error);
        }
      }
      
      // Ensuite les settings
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.siteName && !savedDesign) finalSiteName = parsed.siteName;
          if (parsed.siteDescription) finalDescription = parsed.siteDescription;
          console.log('🚀 SIMPLE FRONT HOME - Settings loaded:', parsed.siteName);
        } catch (error) {
          console.error('Settings parse error:', error);
        }
      }
      
      setSettings({
        siteName: finalSiteName,
        siteDescription: finalDescription
      });
      
      document.title = finalSiteName;
      console.log('🚀 SIMPLE FRONT HOME - Final siteName:', finalSiteName);
    };
    
    loadSiteData();
    
    // Écouter les changements
    const handleDataChange = () => {
      console.log('📡 SIMPLE FRONT HOME - Data change detected');
      loadSiteData();
    };

    window.addEventListener('storage', handleDataChange);
    window.addEventListener('websiteDesignUpdated', handleDataChange);
    window.addEventListener('websiteDesignSaved', handleDataChange);
    window.addEventListener('websiteSettingsUpdated', handleDataChange);
    
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('websiteDesignUpdated', handleDataChange);
      window.removeEventListener('websiteDesignSaved', handleDataChange);
      window.removeEventListener('websiteSettingsUpdated', handleDataChange);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Bienvenue sur {settings.siteName}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {settings.siteDescription}
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Découvrir
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Artistes</h3>
              <p className="text-gray-600">Découvrez nos artistes talentueux</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Événements</h3>
              <p className="text-gray-600">Retrouvez tous nos événements</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">Contactez-nous facilement</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

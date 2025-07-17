
import React from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useSimpleWebsiteSync } from '@/hooks/useSimpleWebsiteSync';

export const SimpleFrontHeader: React.FC = () => {
  const { config } = useWebsiteConfig();
  useSimpleWebsiteSync();

  console.log('🏠 Header rendering with config:', config.siteName);

  return (
    <header 
      className="py-4 px-6 border-b"
      style={{
        background: config.headerBg,
        color: config.textColor
      }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {config.logo && (
              <img 
                src={config.logo} 
                alt="Logo" 
                className="h-8 w-auto"
                onError={(e) => { 
                  console.error('❌ Logo loading error');
                  (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                }}
              />
            )}
            <h1 className="text-xl font-bold" style={{ color: config.textColor }}>
              {config.siteName}
            </h1>
          </div>
          <nav className="flex space-x-6">
            <a 
              href="/front" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Accueil
            </a>
            <a 
              href="/front/artistes" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Artistes
            </a>
            <a 
              href="/front/events" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Événements
            </a>
            <a 
              href="/front/contact" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

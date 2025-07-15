
import React from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const SimpleFrontHeader: React.FC = () => {
  const { config } = useWebsiteConfig();

  return (
    <header 
      className="sticky top-0 z-50 w-full shadow-md"
      style={{
        background: config.headerBg,
        color: config.textColor
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et nom */}
          <Link to="/front" className="flex items-center space-x-3">
            {config.logo && (
              <img
                src={config.logo}
                alt="Logo"
                className="h-12 w-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <h1 className="text-2xl font-bold" style={{ color: config.textColor }}>
              {config.siteName}
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/front" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Accueil
            </Link>
            <Link 
              to="/front/artists" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Artistes
            </Link>
            <Link 
              to="/front/events" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Événements
            </Link>
            <Link 
              to="/front/contact" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: config.linkColor }}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

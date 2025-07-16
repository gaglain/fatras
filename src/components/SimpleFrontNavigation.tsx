
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const SimpleFrontNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { config } = useWebsiteConfig();

  console.log('🎯 SimpleFrontNavigation - Current siteName:', config.siteName);

  return (
    <nav 
      className="sticky top-0 z-50 w-full shadow-md"
      style={{
        background: config.headerBg,
        color: config.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom */}
          <Link to="/front" className="flex items-center space-x-3">
            {config.logo && (
              <img
                src={config.logo}
                alt="Logo"
                className="h-10 w-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-xl font-bold" style={{ color: config.textColor }}>
              {config.siteName}
            </span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6">
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
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            style={{ color: config.textColor }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/front" 
                className="block py-2 hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/front/artists" 
                className="block py-2 hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                Artistes
              </Link>
              <Link 
                to="/front/events" 
                className="block py-2 hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              <Link 
                to="/front/contact" 
                className="block py-2 hover:opacity-80 transition-opacity"
                style={{ color: config.linkColor }}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

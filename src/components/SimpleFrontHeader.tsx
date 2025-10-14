
import React from 'react';
import { Link } from 'react-router-dom';
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
            {config.menuItems?.filter(item => item.visible)
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const isExternal = item.path.startsWith('http') || item.path.startsWith('//');
                return isExternal ? (
                  <a 
                    key={item.id}
                    href={item.path} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: config.linkColor }}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: config.linkColor }}
                  >
                    {item.label}
                  </Link>
                );
              }) || (
                // Menu par défaut si pas de menuItems
                <>
                  <Link to="/front" className="hover:opacity-80 transition-opacity" style={{ color: config.linkColor }}>Accueil</Link>
                  <Link to="/front/artistes" className="hover:opacity-80 transition-opacity" style={{ color: config.linkColor }}>Artistes</Link>
                  <Link to="/front/events" className="hover:opacity-80 transition-opacity" style={{ color: config.linkColor }}>Événements</Link>
                  <Link to="/front/contact" className="hover:opacity-80 transition-opacity" style={{ color: config.linkColor }}>Contact</Link>
                </>
              )}
          </nav>
        </div>
      </div>
    </header>
  );
};


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnifiedSiteData } from '@/hooks/useUnifiedSiteData';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
}

export const SimpleFrontNavigation: React.FC = () => {
  const [menuItems] = useState<MenuItem[]>([
    { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1 },
    { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2 },
    { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3 },
    { id: '4', label: 'Contact', path: '/front/contact', visible: true, order: 4 }
  ]);

  const siteData = useUnifiedSiteData();

  console.log('🎨 Navigation render - Current siteName:', siteData.siteName);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full shadow-lg border-b front-header"
      data-theme-element="header"
      style={{
        background: siteData.headerBg,
        color: siteData.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/front" className="flex items-center space-x-2">
            {siteData.logo ? (
              <img 
                src={siteData.logo} 
                alt={siteData.siteName}
                className="site-logo h-8 w-auto"
                onError={(e) => {
                  console.warn('⚠️ Logo failed to load:', siteData.logo);
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => {
                  console.log('🖼️ Logo loaded successfully');
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {siteData.siteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span 
              className="site-name font-bold text-xl"
              data-site-name
              style={{ color: siteData.textColor }}
              key={`site-name-${siteData.siteName}-${Date.now()}`}
            >
              {siteData.siteName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="hover:opacity-80 transition-opacity front-link"
                data-theme-element="link"
                style={{ color: siteData.linkColor }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <button className="p-2" style={{ color: siteData.textColor }}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteMenuSync } from '@/hooks/useWebsiteMenuSync';
import { useWebsiteSettingsSync } from '@/hooks/useWebsiteSettingsSync';
import { useWebsiteDesignSync } from '@/hooks/useWebsiteDesignSync';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  parent_id?: string;
  menu_order: number;
  is_visible: boolean;
  target: string;
  children?: MenuItem[];
}

export const DynamicFrontNavigation: React.FC = () => {
  const { menuItems } = useWebsiteMenuSync();
  const [organizedMenu, setOrganizedMenu] = useState<MenuItem[]>([]);
  const [siteName, setSiteName] = useState('MusiConnect');
  const [logo, setLogo] = useState('');
  
  useWebsiteSettingsSync();
  useWebsiteDesignSync();

  // Organiser le menu en arbre hiérarchique
  useEffect(() => {
    const organizeMenuItems = (items: any[]) => {
      const itemMap: { [key: string]: MenuItem } = {};
      const rootItems: MenuItem[] = [];

      // Créer une map de tous les éléments
      items.forEach(item => {
        itemMap[item.id] = { ...item, children: [] };
      });

      // Organiser en arbre
      items.forEach(item => {
        if (item.parent_id && itemMap[item.parent_id]) {
          itemMap[item.parent_id].children!.push(itemMap[item.id]);
        } else {
          rootItems.push(itemMap[item.id]);
        }
      });

      return rootItems.sort((a, b) => a.menu_order - b.menu_order);
    };

    if (menuItems.length > 0) {
      setOrganizedMenu(organizeMenuItems(menuItems));
    }
  }, [menuItems]);

  // Écouter les changements de paramètres
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      const settings = event.detail;
      if (settings.siteName) {
        setSiteName(settings.siteName);
      }
    };

    const handleDesignUpdate = () => {
      const savedDesign = localStorage.getItem('websiteDesign');
      const savedSettings = localStorage.getItem('websiteSettings');
      
      if (savedDesign) {
        try {
          const design = JSON.parse(savedDesign);
          if (design.logo) setLogo(design.logo);
          if (design.siteName) setSiteName(design.siteName);
        } catch (error) {
          console.error('Erreur parsing design:', error);
        }
      }
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.siteName) setSiteName(settings.siteName);
        } catch (error) {
          console.error('Erreur parsing settings:', error);
        }
      }
    };

    handleDesignUpdate();
    
    window.addEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
    window.addEventListener('websiteDesignSaved', handleDesignUpdate);
    window.addEventListener('websiteDesignUpdated', handleDesignUpdate);
    window.addEventListener('storage', handleDesignUpdate);

    return () => {
      window.removeEventListener('websiteSettingsUpdated', handleSettingsUpdate as EventListener);
      window.removeEventListener('websiteDesignSaved', handleDesignUpdate);
      window.removeEventListener('websiteDesignUpdated', handleDesignUpdate);
      window.removeEventListener('storage', handleDesignUpdate);
    };
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    const isExternal = item.url.startsWith('http') || item.url.startsWith('//');

    return (
      <div key={item.id} className="relative group">
        {isExternal ? (
          <a
            href={item.url}
            target={item.target}
            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </a>
        ) : (
          <Link
            to={item.url}
            className="front-link px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--site-link-color, #3b82f6)' }}
          >
            {item.label}
          </Link>
        )}
        
        {item.children && item.children.length > 0 && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              {item.children.map(child => (
                child.url.startsWith('http') ? (
                  <a
                    key={child.id}
                    href={child.url}
                    target={child.target}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {child.label}
                  </a>
                ) : (
                  <Link
                    key={child.id}
                    to={child.url}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {child.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header 
      className="front-header sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-theme-element="header"
      style={{
        backgroundColor: 'var(--site-header-bg, #ffffff)',
        color: 'var(--site-text-color, #1f2937)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et nom du site */}
          <Link to="/front" className="flex items-center space-x-2">
            {logo ? (
              <img 
                src={logo} 
                alt={siteName}
                className="site-logo h-8 w-auto"
                style={{ maxHeight: '32px' }}
              />
            ) : (
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {siteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span 
              className="site-name font-bold text-xl"
              data-site-name
              style={{ color: 'var(--site-text-color, #1f2937)' }}
            >
              {siteName}
            </span>
          </Link>

          {/* Menu de navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {organizedMenu.map(renderMenuItem)}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button className="p-2">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

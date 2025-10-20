import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  FileText, 
  Menu, 
  Palette, 
  Settings, 
  Eye,
  ExternalLink,
  Home
} from 'lucide-react';

export const WebsiteManagerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: Home,
      path: '/website'
    },
    {
      id: 'pages',
      label: 'Pages',
      icon: FileText,
      path: '/website-manager'
    },
    {
      id: 'menu',
      label: 'Menus',
      icon: Menu,
      path: '/website-backoffice'
    },
    {
      id: 'design',
      label: 'Design',
      icon: Palette,
      path: '/website'
    },
    {
      id: 'fonts',
      label: 'Typographie',
      icon: Settings,
      path: '/website/fonts'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      path: '/website'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

const handlePreviewSite = () => {
  navigate('/front');
};

  return (
    <div className="w-64 h-full bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Site Web
        </h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handlePreviewSite}
        >
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button
          className="w-full justify-start"
          onClick={handlePreviewSite}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Voir le site
        </Button>
      </div>
    </div>
  );
};
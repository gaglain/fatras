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
  Home,
  X
} from 'lucide-react';

interface WebsiteManagerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const WebsiteManagerSidebar: React.FC<WebsiteManagerSidebarProps> = ({ 
  isOpen = true, 
  onClose 
}) => {
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
    onClose?.();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div className={`
      fixed lg:relative inset-y-0 left-0 z-50
      w-64 h-full bg-card border-r flex flex-col
      transform transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      lg:transform-none
    `}>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Site Web
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigate(item.path)}
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
          onClick={() => handleNavigate('/dashboard')}
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

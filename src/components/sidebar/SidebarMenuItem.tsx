
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/data/navigationData';

interface SidebarMenuItemProps {
  item: MenuItem;
  isChild?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
  item, 
  isChild = false, 
  isOpen = false, 
  onToggle 
}) => {
  const location = useLocation();

  if (!item.visible) return null;

  const isActiveItem = (href: string) => location.pathname === href;

  const isActiveSection = (menuItem: MenuItem) => {
    if (menuItem.children) {
      return menuItem.children.some(child => isActiveItem(child.href));
    }
    return isActiveItem(menuItem.href);
  };

  // Si l'élément a des enfants et n'est pas un enfant lui-même
  if (item.children && !isChild) {
    const isActive = isActiveSection(item);

    return (
      <div className="mb-1">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            isActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          <div className="flex items-center">
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map(child => (
              <SidebarMenuItem key={child.name} item={child} isChild={true} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Élément de menu simple (lien direct)
  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        isChild ? 'ml-2' : '',
        isActiveItem(item.href)
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      )}
    >
      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
      {item.name}
    </Link>
  );
};

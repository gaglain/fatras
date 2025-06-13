
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className={cn(
          'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}>
          <div className="flex items-center">
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            />
            {item.name}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-6 mt-1 space-y-1">
          {item.children.map(child => (
            <SidebarMenuItem key={child.name} item={child} isChild={true} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Élément de menu simple (lien direct)
  return (
    <Link
      to={item.href}
      className={cn(
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
        isChild ? 'ml-2 pl-6' : '',
        isActiveItem(item.href)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <item.icon
        className={cn(
          'mr-3 h-4 w-4 flex-shrink-0',
          isActiveItem(item.href) ? 'text-primary-foreground' : 'text-muted-foreground'
        )}
      />
      {item.name}
    </Link>
  );
};

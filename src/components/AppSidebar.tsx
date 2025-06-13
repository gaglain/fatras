
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/useNavigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function AppSidebar() {
  const { navigation, openSections, toggleSection } = useNavigation();
  const location = useLocation();

  const isActiveItem = (href: string) => location.pathname === href;
  
  const isActiveSection = (menuItem: any) => {
    if (menuItem.children) {
      return menuItem.children.some((child: any) => isActiveItem(child.href));
    }
    return isActiveItem(menuItem.href);
  };

  return (
    <Sidebar className="bg-sidebar-background border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-background">
        <div className="flex items-center px-4 py-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Navigation</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (!item.visible) return null;

                // Si l'élément a des enfants
                if (item.children) {
                  const isOpen = openSections.includes(item.name);
                  const isActive = isActiveSection(item);

                  return (
                    <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.name}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  className={`text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                    isActiveItem(child.href) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                                  }`}
                                >
                                  <Link to={child.href}>
                                    <child.icon className="mr-3 h-4 w-4" />
                                    <span>{child.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Élément de menu simple
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      className={`text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        isActiveItem(item.href) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      }`}
                    >
                      <Link to={item.href}>
                        <item.icon className="mr-3 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

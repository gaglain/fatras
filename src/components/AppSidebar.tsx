
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
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
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
    <Sidebar>
      <SidebarHeader className="border-b">
        <h2 className="text-lg font-semibold px-4 py-2">Navigation</h2>
      </SidebarHeader>
      <SidebarContent>
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
                            className="w-full justify-between"
                            isActive={isActive}
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-2 h-4 w-4" />
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
                                <SidebarMenuSubButton asChild isActive={isActiveItem(child.href)}>
                                  <Link to={child.href}>
                                    <child.icon className="mr-2 h-4 w-4" />
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
                    <SidebarMenuButton asChild isActive={isActiveItem(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
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

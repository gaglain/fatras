
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
    <Sidebar className="bg-background border-r border-border">
      <SidebarHeader className="border-b border-border bg-background px-4 py-4">
        <div className="flex items-center">
          <h2 className="text-base lg:text-lg font-semibold text-[#1632f4] truncate">Navigation</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background">
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
                            className={`w-full justify-between text-[#1632f4] hover:bg-accent hover:text-[#1632f4] transition-colors ${
                              isActive ? 'bg-accent text-[#1632f4] font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              <item.icon className="mr-3 h-4 w-4 flex-shrink-0 text-[#1632f4]" />
                              <span className="truncate text-sm text-[#1632f4]">{item.name}</span>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#1632f4]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#1632f4]" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.name}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  className={`text-[#1632f4] hover:bg-accent hover:text-[#1632f4] transition-colors ${
                                    isActiveItem(child.href) ? 'bg-accent text-[#1632f4] font-medium' : ''
                                  }`}
                                >
                                  <Link to={child.href} className="flex items-center min-w-0">
                                    <child.icon className="mr-3 h-4 w-4 flex-shrink-0 text-[#1632f4]" />
                                    <span className="truncate text-sm text-[#1632f4]">{child.name}</span>
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
                      className={`text-[#1632f4] hover:bg-accent hover:text-[#1632f4] transition-colors ${
                        isActiveItem(item.href) ? 'bg-accent text-[#1632f4] font-medium' : ''
                      }`}
                    >
                      <Link to={item.href} className="flex items-center min-w-0">
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0 text-[#1632f4]" />
                        <span className="truncate text-sm text-[#1632f4]">{item.name}</span>
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

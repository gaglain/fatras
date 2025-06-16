
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
import { useTheme } from '@/contexts/ThemeContext';

export function AppSidebar() {
  const { navigation, openSections, toggleSection } = useNavigation();
  const location = useLocation();
  const { theme } = useTheme();

  function getSidebarIconColor(): string {
    const root = document.documentElement;
    if (theme === "dark") {
      return getComputedStyle(root).getPropertyValue("--custom-sidebarIconDark")?.trim() || "#ffffff";
    } else {
      return getComputedStyle(root).getPropertyValue("--custom-sidebarIconLight")?.trim() || "#1632f4";
    }
  }

  const sidebarIconColor = getSidebarIconColor();

  const isActiveItem = (href: string) => location.pathname === href;
  
  const isActiveSection = (menuItem: any) => {
    if (menuItem.children) {
      return menuItem.children.some((child: any) => isActiveItem(child.href));
    }
    return isActiveItem(menuItem.href);
  };

  return (
    <Sidebar className="h-full transition-colors duration-300" style={{
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      borderRight: `1px solid var(--custom-buttonBg, #1632f4)`
    }}>
      <SidebarHeader className="border-b px-4 py-4" style={{
        borderColor: 'var(--custom-buttonBg, #1632f4)',
        background: 'var(--custom-cardBg, #ffffff)'
      }}>
        <div className="flex items-center">
          <h2 className="text-base lg:text-lg font-semibold truncate" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            Navigation
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent style={{
        background: 'var(--custom-cardBg, #ffffff)'
      }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (!item.visible) return null;

                if (item.children) {
                  const isOpen = openSections.includes(item.name);
                  const isActive = isActiveSection(item);

                  return (
                    <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="w-full justify-between transition-colors border-0"
                            style={{
                              color: isActive ? '#ffffff' : 'var(--custom-cardText, #18181b)',
                              backgroundColor: isActive ? '#1a365d' : 'transparent',
                              borderRadius: '6px',
                              marginBottom: '2px'
                            }}
                          >
                            <div className="flex items-center min-w-0">
                              <item.icon className="mr-3 h-4 w-4 flex-shrink-0" color={isActive ? '#ffffff' : sidebarIconColor} />
                              <span className="truncate text-sm" style={{ color: isActive ? '#ffffff' : 'var(--custom-cardText, #18181b)' }}>
                                {item.name}
                              </span>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 flex-shrink-0" color={isActive ? '#ffffff' : sidebarIconColor} />
                            ) : (
                              <ChevronRight className="h-4 w-4 flex-shrink-0" color={isActive ? '#ffffff' : sidebarIconColor} />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.name}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  className="transition-colors border-0"
                                  style={{
                                    backgroundColor: isActiveItem(child.href) ? '#1a365d' : 'transparent',
                                    borderRadius: '6px',
                                    marginBottom: '1px'
                                  }}
                                >
                                  <Link to={child.href} className="flex items-center min-w-0">
                                    <child.icon className="mr-3 h-4 w-4 flex-shrink-0" color={isActiveItem(child.href) ? '#ffffff' : sidebarIconColor} />
                                    <span className="truncate text-sm" style={{
                                      color: isActiveItem(child.href) ? '#ffffff' : 'var(--custom-cardText, #18181b)'
                                    }}>
                                      {child.name}
                                    </span>
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

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      className="transition-colors border-0"
                      style={{
                        color: isActiveItem(item.href) ? '#ffffff' : 'var(--custom-cardText, #18181b)',
                        backgroundColor: isActiveItem(item.href) ? '#1a365d' : 'transparent',
                        borderRadius: '6px',
                        marginBottom: '2px'
                      }}
                    >
                      <Link to={item.href} className="flex items-center min-w-0">
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" color={isActiveItem(item.href) ? '#ffffff' : sidebarIconColor} />
                        <span className="truncate text-sm" style={{ color: isActiveItem(item.href) ? '#ffffff' : 'var(--custom-cardText, #18181b)' }}>
                          {item.name}
                        </span>
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

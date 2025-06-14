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

  // Couleur d'icône paramétrable par l'utilisateur (préférences couleurs)
  // Récupération des variables CSS custom
  function getSidebarIconColor(): string {
    // Les variables CSS sont stockées en "--custom-sidebarIconLight" et "--custom-sidebarIconDark"
    const root = document.documentElement;
    if (theme === "dark") {
      return getComputedStyle(root).getPropertyValue("--custom-sidebarIconDark")?.trim() || "#ffffff";
    } else {
      return getComputedStyle(root).getPropertyValue("--custom-sidebarIconLight")?.trim() || "#1632f4";
    }
  }

  const sidebarIconColor = getSidebarIconColor();

  // Définir les couleurs dynamiques selon le thème
  const isDark = theme === 'dark';
  const sidebarBg = isDark ? 'bg-[#1632f4]' : 'bg-white';
  const sidebarText = isDark ? 'text-white' : 'text-[#1632f4]';
  // Trait gauche rose dans le back office (ex: #ec5f65)
  const sidebarBorder = isDark
    ? 'border-l-4 border-[#ec5f65]'
    : 'border-l-4 border-[#1632f4]';

  const isActiveItem = (href: string) => location.pathname === href;
  
  const isActiveSection = (menuItem: any) => {
    if (menuItem.children) {
      return menuItem.children.some((child: any) => isActiveItem(child.href));
    }
    return isActiveItem(menuItem.href);
  };

  return (
    <Sidebar className={`${sidebarBg} ${sidebarText} ${sidebarBorder} h-full transition-colors duration-300`}>
      <SidebarHeader className={`border-b border-border ${sidebarBg} px-4 py-4`}>
        <div className="flex items-center">
          <h2 className={`text-base lg:text-lg font-semibold truncate ${sidebarText}`}>Navigation</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className={`${sidebarBg}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (!item.visible) return null;

                // Élément avec enfants = menu avec sous-menus
                if (item.children) {
                  const isOpen = openSections.includes(item.name);
                  const isActive = isActiveSection(item);

                  return (
                    <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`w-full justify-between ${sidebarText} hover:bg-accent hover:text-[#1632f4] transition-colors ${
                              isActive ? 'bg-accent text-[#1632f4] font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              <item.icon className={`mr-3 h-4 w-4 flex-shrink-0`} color={sidebarIconColor} />
                              <span className={`truncate text-sm ${sidebarText}`}>{item.name}</span>
                            </div>
                            {isOpen ? (
                              <ChevronDown className={`h-4 w-4 flex-shrink-0`} color={sidebarIconColor} />
                            ) : (
                              <ChevronRight className={`h-4 w-4 flex-shrink-0`} color={sidebarIconColor} />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.name}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  className={`hover:bg-accent transition-colors ${
                                    isActiveItem(child.href) ? 'bg-accent text-[#1632f4] font-medium' : 'text-[#1632f4]'
                                  }`}
                                >
                                  <Link to={child.href} className="flex items-center min-w-0">
                                    {/* Ici couleur dynamique icône sous-menu */}
                                    <child.icon className="mr-3 h-4 w-4 flex-shrink-0" color={sidebarIconColor} />
                                    <span className="truncate text-sm" style={{ color: theme === 'dark' ? '#fff' : '#1632f4' }}>{child.name}</span>
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
                      className={`${sidebarText} hover:bg-accent hover:text-[#1632f4] transition-colors ${
                        isActiveItem(item.href) ? 'bg-accent text-[#1632f4] font-medium' : ''
                      }`}
                    >
                      <Link to={item.href} className="flex items-center min-w-0">
                        {/* Ici couleur dynamique pour icônes des menus principaux aussi */}
                        <item.icon className={`mr-3 h-4 w-4 flex-shrink-0`} color={sidebarIconColor} />
                        <span className={`truncate text-sm ${sidebarText}`}>{item.name}</span>
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

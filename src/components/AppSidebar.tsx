
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from 'next-themes';
import { ChevronRight } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigation } from "@/hooks/useNavigation";

export function AppSidebar() {
  const location = useLocation();
  const { theme } = useTheme();
  const { navigation, openSections, toggleSection } = useNavigation();
  
  console.log('🎨 AppSidebar - Current theme:', theme);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isChildActive = (children: any[]) => {
    return children.some(child => isActive(child.href));
  };

  return (
    <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarContent>
        <div className="p-4">
          <SidebarTrigger />
        </div>
        
        {navigation.map((item) => {
          if (!item.visible) return null;
          
          // Si l'élément a des enfants, créer un groupe collapsible
          if (item.children && item.children.length > 0) {
            const hasActiveChild = isChildActive(item.children);
            const isOpen = openSections.includes(item.name);
            
            return (
              <SidebarGroup key={item.name}>
                <Collapsible open={isOpen}>
                  <CollapsibleTrigger
                    onClick={() => toggleSection(item.name)}
                    className="w-full"
                  >
                    <SidebarGroupLabel className="text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider flex items-center justify-between hover:bg-sidebar-accent px-2 py-1 rounded">
                      <span>{item.name}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.children.filter(child => child.visible !== false).map((child) => (
                          <SidebarMenuItem key={child.href}>
                             <SidebarMenuButton asChild isActive={isActive(child.href)}>
                               <Link to={child.href} className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                 <child.icon className="h-5 w-5" />
                                 <span className="font-medium">{child.name}</span>
                               </Link>
                             </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            );
          } else {
            // Élément de menu simple sans enfants
            return (
              <SidebarGroup key={item.name}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                       <SidebarMenuButton asChild isActive={isActive(item.href)}>
                         <Link to={item.href} className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                           <item.icon className="h-5 w-5" />
                           <span className="font-medium">{item.name}</span>
                         </Link>
                       </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
        })}
      </SidebarContent>
    </Sidebar>
  );
}

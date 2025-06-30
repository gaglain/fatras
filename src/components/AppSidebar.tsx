
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from 'next-themes';
import {
  Calendar,
  Users,
  FileText,
  Settings,
  Home,
  Mail,
  MessageSquare,
  Briefcase,
  Music,
  Globe,
  BarChart3,
  UserPlus,
  ClipboardList,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    group: "Principal",
  },
  {
    title: "Artistes",
    url: "/artists",
    icon: Music,
    group: "Principal",
  },
  {
    title: "Événements",
    url: "/events",
    icon: Calendar,
    group: "Principal",
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
    group: "Gestion",
  },
  {
    title: "Préférences",
    url: "/preferences",
    icon: Settings,
    group: "Administration",
  },
];

const groupedItems = menuItems.reduce((acc, item) => {
  if (!acc[item.group]) {
    acc[item.group] = [];
  }
  acc[item.group].push(item);
  return acc;
}, {} as Record<string, typeof menuItems>);

export function AppSidebar() {
  const location = useLocation();
  const { theme } = useTheme();
  
  console.log('🎨 AppSidebar - Current theme:', theme);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Sidebar className="border-r bg-white">
      <SidebarContent>
        <div className="p-4">
          <SidebarTrigger />
        </div>
        
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

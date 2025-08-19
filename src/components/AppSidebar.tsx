import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Music, 
  Calendar, 
  CheckSquare, 
  Mail, 
  ShoppingBag, 
  BookOpen, 
  FileText,
  Settings,
  UserCheck,
  Home
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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: Home },
    { path: "/contacts", label: "Contacts", icon: Users },
    { path: "/artists", label: "Artistes", icon: Music },
    { path: "/events", label: "Événements", icon: Calendar },
    { path: "/agenda", label: "Agenda", icon: Calendar },
    { path: "/tasks", label: "Tâches", icon: CheckSquare },
    { path: "/contracts", label: "Contrats", icon: FileText },
    { path: "/email", label: "Email", icon: Mail },
    { path: "/email-campaigns", label: "Campagnes Email", icon: Mail },
    { path: "/merchandise", label: "Boutique", icon: ShoppingBag },
    { path: "/show-bible", label: "Show Bible", icon: BookOpen },
    { path: "/contact-lists", label: "Listes de contacts", icon: Users },
    { path: "/event-types", label: "Types d'événements", icon: Calendar },
    { path: "/opportunities", label: "Opportunités", icon: Calendar },
    { path: "/roadshow", label: "Feuille de route", icon: Calendar },
    { path: "/messagerie", label: "Messagerie", icon: Mail },
    { path: "/forms", label: "Formulaires", icon: FileText },
    { path: "/publication-calendar", label: "Calendrier de publication", icon: Calendar },
    { path: "/website", label: "Site Web", icon: Settings },
    { path: "/application", label: "Application", icon: Settings },
    { path: "/user-management", label: "Gestion des utilisateurs", icon: UserCheck },
    { path: "/preferences", label: "Préférences", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.path}>
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
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
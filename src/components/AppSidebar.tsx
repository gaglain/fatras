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
    <div className="w-64 bg-white border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
      </div>
      
      <nav className="px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
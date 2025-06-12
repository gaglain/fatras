
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Music, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Mail, 
  MessageSquare, 
  Clock, 
  Book, 
  MapPin, 
  ShoppingBag, 
  Target, 
  Globe, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Contact,
  MailOpen
} from 'lucide-react';

const menuItems = [
  { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
  { 
    icon: Users, 
    label: 'Contacts', 
    items: [
      { to: '/contacts', label: 'Tous les contacts' },
      { to: '/contact-lists', label: 'Listes de contacts' }
    ]
  },
  { to: '/artists', icon: Music, label: 'Artistes' },
  { 
    icon: Calendar, 
    label: 'Événements', 
    items: [
      { to: '/events', label: 'Tous les événements' },
      { to: '/event-types', label: 'Types d\'événements' }
    ]
  },
  { to: '/tasks', icon: CheckSquare, label: 'Tâches' },
  { to: '/contracts', icon: FileText, label: 'Contrats' },
  { 
    icon: Mail, 
    label: 'Communication', 
    items: [
      { to: '/email', label: 'Emails' },
      { to: '/email-campaigns', label: 'Campagnes' },
      { to: '/messagerie', label: 'Messagerie' },
      { to: '/forms', label: 'Formulaires' }
    ]
  },
  { to: '/agenda', icon: Clock, label: 'Agenda' },
  { to: '/show-bible', icon: Book, label: 'Show Bible' },
  { to: '/road-show', icon: MapPin, label: 'Road Show' },
  { to: '/merchandise', icon: ShoppingBag, label: 'Merchandising' },
  { to: '/opportunities', icon: Target, label: 'Opportunités' },
  { to: '/website', icon: Globe, label: 'Site Web' },
  { to: '/preferences', icon: Settings, label: 'Préférences' }
];

export const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: any, index: number) => {
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const Icon = item.icon;

    if (hasSubItems) {
      return (
        <div key={index}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className="w-full flex items-center justify-between px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md text-sm font-medium group transition-colors"
          >
            <div className="flex items-center">
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.items.map((subItem: any, subIndex: number) => (
                <NavLink
                  key={subIndex}
                  to={subItem.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-sidebar-primary/10 text-sidebar-primary font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  {subItem.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={index}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md text-sm font-medium group transition-colors ${
            isActive ? 'bg-sidebar-primary/10 text-sidebar-primary' : ''
          }`
        }
      >
        <Icon className="mr-3 h-4 w-4" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-sidebar-background border-r border-sidebar-border">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div className="ml-3">
                <p className="text-lg font-semibold text-sidebar-foreground">MusicCRM</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map(renderMenuItem)}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

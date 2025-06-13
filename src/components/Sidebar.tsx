
import React from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { SidebarMenuItem } from './sidebar/SidebarMenuItem';

export const Sidebar: React.FC = () => {
  const { navigation, openSections, toggleSection } = useNavigation();

  return (
    <div className="w-64 bg-background border-r border-border">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map(item => (
            <SidebarMenuItem
              key={item.name}
              item={item}
              isOpen={openSections.includes(item.name)}
              onToggle={() => toggleSection(item.name)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

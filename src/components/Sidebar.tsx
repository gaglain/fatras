
import React from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { SidebarMenuItem } from './sidebar/SidebarMenuItem';

export const Sidebar: React.FC = () => {
  const { navigation, openSections, toggleSection } = useNavigation();

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
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
    </div>
  );
};

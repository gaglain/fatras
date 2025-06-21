
import React from 'react';
import { SidebarCustomizer } from '@/components/SidebarCustomizer';

export const SidebarTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personnalisation de la Sidebar</h3>
        <p className="text-sm text-muted-foreground">
          Personnalisez l'apparence de la barre latérale de navigation.
        </p>
      </div>
      <SidebarCustomizer />
    </div>
  );
};

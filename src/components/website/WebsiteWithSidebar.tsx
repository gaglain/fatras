import React from 'react';
import { WebsiteManagerSidebar } from './WebsiteManagerSidebar';

interface WebsiteWithSidebarProps {
  children: React.ReactNode;
}

export const WebsiteWithSidebar: React.FC<WebsiteWithSidebarProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <WebsiteManagerSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
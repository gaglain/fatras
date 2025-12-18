import React, { useState } from 'react';
import { WebsiteManagerSidebar } from './WebsiteManagerSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface WebsiteWithSidebarProps {
  children: React.ReactNode;
}

export const WebsiteWithSidebar: React.FC<WebsiteWithSidebarProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className="hidden lg:block">
        <WebsiteManagerSidebar />
      </div>
      
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <WebsiteManagerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header with menu button */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b p-3 flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Site Web</span>
        </div>
        
        {children}
      </div>
    </div>
  );
};

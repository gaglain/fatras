
import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  logo?: string | null;
  companyName?: string;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  logo, 
  companyName = 'ShowManager Pro',
  notificationCount = 0 
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {logo && (
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          )}
          <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
          
          <div className="relative max-w-md ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts, events, tasks..."
              className="pl-10 w-96"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
          
          <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AB</span>
          </div>
        </div>
      </div>
    </header>
  );
};

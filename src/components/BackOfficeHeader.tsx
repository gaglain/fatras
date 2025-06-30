
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FrontThemeToggle } from './FrontThemeToggle';
import { useTheme } from 'next-themes';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from './UserProfile';
import { NotificationCenter } from './NotificationCenter';
import { RealtimeIndicator } from '@/components/ui/realtime-indicator';

export const BackOfficeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { name, logo } = useCompanySettings();
  const { currentUser } = useUser();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(3);

  const isDark = theme === "dark";

  const handleNotificationClick = () => {
    setShowNotifications(prev => !prev);
  };

  return (
    <>
      <header 
        className={`shadow-sm relative border-b transition-colors duration-300 ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <img
                  src={logo || "/logo.svg"}
                  alt={name}
                  className="h-9 w-9 object-contain"
                  style={{ filter: isDark ? "drop-shadow(0 2px 7px #fff9)" : "drop-shadow(0 2px 7px #1632f4)" }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <span 
                  className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {name || "MusiConnect"}
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealtimeIndicator />
              
              <div className="relative">
                <Button 
                  onClick={handleNotificationClick}
                  variant="ghost"
                  size="icon"
                  className={`relative hover:opacity-80 transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="absolute w-6 h-6 bg-red-500 rounded-full animate-pulse -top-px -left-px"></div>
                      <div className="relative h-5 w-5 bg-red-500 text-white flex items-center justify-center text-xs rounded-full border-2 border-white font-semibold">
                        {unreadCount}
                      </div>
                    </div>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 z-50">
                    <NotificationCenter onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>
              
              <FrontThemeToggle variant="back-office" />
              
              <button
                className="flex items-center space-x-2 focus:outline-none group transition-all duration-300"
                onClick={() => setShowUserProfile(true)}
                aria-label="Voir le profil"
              >
                <Avatar className="h-8 w-8 border-2 border-blue-600">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="text-base bg-blue-600 text-white">
                    {currentUser?.name?.charAt(0)}
                    {currentUser?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span 
                  className={`hidden md:block text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {currentUser?.name}
                </span>
              </button>
            </div>
          </div>
          
          {showUserProfile && (
            <UserProfile onClose={() => setShowUserProfile(false)} />
          )}
        </div>
      </header>
    </>
  );
};

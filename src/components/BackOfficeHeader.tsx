
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Bell, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FrontThemeToggle } from './FrontThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from './UserProfile';

export const BackOfficeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { name, logo } = useCompanySettings();
  const { currentUser } = useUser();
  const [showUserProfile, setShowUserProfile] = useState(false);

  const isDark = theme === "dark";
  const headerClasses = isDark
    ? "bg-[#1632f4] text-white"
    : "bg-white text-[#1632f4]";
  const borderClasses = isDark
    ? "border-b border-[#1632f4]"
    : "border-b border-gray-200";

  return (
    <header className={`${headerClasses} ${borderClasses} shadow-sm`}>
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
              <span className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-[#1632f4]"}`}>
                {name || "MusiConnect"}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Aide</span>
            </Button>
            <FrontThemeToggle variant="back-office" />
            
            <button
              className="flex items-center space-x-2 focus:outline-none group"
              onClick={() => setShowUserProfile(true)}
              aria-label="Voir le profil"
            >
              <Avatar className="h-8 w-8 border-2 border-[#ec5f65]">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback className="text-base bg-[#ec5f65] text-white">
                  {currentUser?.name?.charAt(0)}
                  {currentUser?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className={`hidden md:block text-sm font-medium ${isDark ? 'text-white' : 'text-[#1632f4]'}`}>
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
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react';
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
  const [showNotificationTest, setShowNotificationTest] = useState(false);

  const isDark = theme === "dark";
  const headerClasses = isDark
    ? "bg-[#1632f4] text-white"
    : "bg-white text-[#1632f4]";
  const borderClasses = isDark
    ? "border-b border-[#1632f4]"
    : "border-b border-gray-200";

  const handleNotificationClick = () => {
    console.log('🔔 BACKOFFICE HEADER - CLIC NOTIFICATION');
    setShowNotificationTest(prev => {
      const newVal = !prev;
      console.log('🔔 BACKOFFICE HEADER - NOUVEAU ÉTAT:', newVal);
      return newVal;
    });
  };

  return (
    <>
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
              {/* TEST BUTTON MEGA VISIBLE */}
              <Button 
                onClick={handleNotificationClick}
                className="relative h-12 w-12 p-0 bg-red-500 hover:bg-red-600 text-white border-4 border-yellow-400"
                style={{ zIndex: 999999 }}
              >
                <Bell className="h-6 w-6" />
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

      {/* POPUP TEST ULTRA VISIBLE */}
      {showNotificationTest && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            console.log('🔔 BACKOFFICE - FERMETURE par clic fond');
            setShowNotificationTest(false);
          }}
        >
          <div 
            style={{
              backgroundColor: 'yellow',
              padding: '50px',
              border: '10px solid black',
              borderRadius: '20px',
              fontSize: '30px',
              fontWeight: 'bold',
              color: 'black',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div>✅ BACKOFFICE POPUP FONCTIONNE !</div>
            <button 
              onClick={() => {
                console.log('🔔 BACKOFFICE - FERMETURE par bouton');
                setShowNotificationTest(false);
              }}
              style={{
                marginTop: '20px',
                padding: '15px 30px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              FERMER
            </button>
          </div>
        </div>
      )}
    </>
  );
};

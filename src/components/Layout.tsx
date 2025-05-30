
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

interface AppPreferences {
  logo?: string | null;
  companyName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  darkMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AppPreferences>({});
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('appPreferences');
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setPreferences(prefs);
      
      // Apply background color
      if (prefs.backgroundColor) {
        document.body.style.backgroundColor = prefs.backgroundColor;
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: preferences.backgroundColor || '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          logo={preferences.logo}
          companyName={preferences.companyName}
          notificationCount={notificationCount}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

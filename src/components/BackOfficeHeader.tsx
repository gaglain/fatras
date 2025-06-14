
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FrontThemeToggle } from './FrontThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export const BackOfficeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { name, logo } = useCompanySettings();

  // Couleurs : fond blanc et texte bleu en clair, fond bleu/texte blanc en sombre
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
          {/* Logo et nom entreprise dynamiques */}
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
          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Rechercher</span>
            </Button>
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Aide</span>
            </Button>
            <FrontThemeToggle variant="back-office" />
            <Link to="/preferences">
              <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className={`${isDark ? "text-white" : "text-[#1632f4]"}`}>
              <User className="h-4 w-4 mr-2" />
              Profil
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

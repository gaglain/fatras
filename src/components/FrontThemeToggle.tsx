
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface FrontThemeToggleProps {
  className?: string;
  variant?: 'front' | 'back-office';
}

export const FrontThemeToggle: React.FC<FrontThemeToggleProps> = ({ 
  className = '', 
  variant = 'front' 
}) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Vérifier le thème actuel au montage
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    // Observer les changements de classe sur l'élément HTML
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', newTheme);
    
    setIsDark(!isDark);
    
    // Déclencher un événement pour forcer la re-application des couleurs
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  };

  if (variant === 'front') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2 rounded-lg transition-all duration-200 ease-in-out
          bg-white/10 hover:bg-white/20 
          text-white hover:text-white
          border border-white/20 hover:border-white/30
          backdrop-blur-sm
          ${className}
        `}
        title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
        aria-label={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 bg-white text-[#1632f4] hover:bg-gray-100 hover:text-[#1632f4] border border-gray-200"
      title={`Basculer vers le mode ${isDark ? 'clair' : 'sombre'}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#1632f4]" />
      ) : (
        <Moon className="h-4 w-4 text-[#1632f4]" />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

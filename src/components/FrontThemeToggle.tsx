
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface FrontThemeToggleProps {
  className?: string;
  variant?: 'front' | 'back-office';
}

export const FrontThemeToggle: React.FC<FrontThemeToggleProps> = ({ 
  className = '', 
  variant = 'front' 
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
        title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
        aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
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
      title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-[#1632f4]" />
      ) : (
        <Sun className="h-4 w-4 text-[#1632f4]" />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

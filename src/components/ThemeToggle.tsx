
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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

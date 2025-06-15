
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
      className="h-8 w-8 p-0 bg-transparent border-none hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-gray-700" />
      ) : (
        <Sun className="h-4 w-4 text-white" />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

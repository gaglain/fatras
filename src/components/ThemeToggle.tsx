
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
      className="h-8 w-8 p-0"
      style={{
        background: 'transparent',
        border: 'none',
        color: theme === 'light' ? '#374151' : '#ffffff'
      }}
      title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" style={{ color: '#374151' }} />
      ) : (
        <Sun className="h-4 w-4" style={{ color: '#ffffff' }} />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

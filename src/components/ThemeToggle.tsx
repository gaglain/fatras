
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
      className="h-8 w-8 p-0 theme-toggle-button"
      style={{
        background: 'transparent !important',
        backgroundColor: 'transparent !important',
        border: 'none !important',
        color: theme === 'light' ? '#374151 !important' : '#ffffff !important',
        minWidth: '32px',
        minHeight: '32px'
      }}
      title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon 
          className="h-4 w-4" 
          style={{ 
            color: '#374151 !important',
            fill: 'none !important',
            stroke: '#374151 !important',
            strokeWidth: '2'
          }} 
        />
      ) : (
        <Sun 
          className="h-4 w-4" 
          style={{ 
            color: '#ffffff !important',
            fill: 'none !important',
            stroke: '#ffffff !important',
            strokeWidth: '2'
          }} 
        />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

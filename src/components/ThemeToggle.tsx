
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
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-text, #666666)',
        border: '1px solid var(--custom-buttonBg, #1632f4)',
        borderRadius: '0'
      }}
      title={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" style={{
          color: 'var(--custom-text, #666666)'
        }} />
      ) : (
        <Sun className="h-4 w-4" style={{
          color: 'var(--custom-text, #666666)'
        }} />
      )}
      <span className="sr-only">Basculer le thème</span>
    </Button>
  );
};

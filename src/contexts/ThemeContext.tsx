
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Fonction pour appliquer les couleurs personnalisées
  const applyCustomColors = (currentTheme: Theme) => {
    const savedColors = localStorage.getItem('customColors');
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        const root = document.documentElement;
        
        // Appliquer les couleurs selon le thème
        const isDark = currentTheme === 'dark';
        root.style.setProperty('--custom-background', isDark ? colors.backgroundDark : colors.background);
        root.style.setProperty('--custom-text', isDark ? colors.textDark : colors.text);
        root.style.setProperty('--custom-cardBg', isDark ? colors.cardBgDark : colors.cardBg);
        root.style.setProperty('--custom-cardText', isDark ? colors.cardTextDark : colors.cardText);
        root.style.setProperty('--custom-buttonBg', isDark ? colors.buttonBgDark : colors.buttonBg);
        root.style.setProperty('--custom-buttonText', isDark ? colors.buttonTextDark : colors.buttonText);
        root.style.setProperty('--custom-chatWidgetBg', colors.chatWidgetBg);
        root.style.setProperty('--custom-chatWidgetIcon', colors.chatWidgetIcon);
        
        console.log('Custom colors applied for theme:', currentTheme);
      } catch (error) {
        console.error('Error applying custom colors:', error);
      }
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Appliquer les couleurs personnalisées
    applyCustomColors(theme);
    
    // Optimisation éco-conception : réduire les animations en mode sombre pour économiser l'énergie
    if (theme === 'dark') {
      root.style.setProperty('--animation-reduce-factor', '0.5');
    } else {
      root.style.removeProperty('--animation-reduce-factor');
    }
    
    console.log('Theme applied:', theme, 'Classes on html:', root.className);
  }, [theme]);

  // Écouter les changements de couleurs personnalisées
  useEffect(() => {
    const handleColorsChanged = (event: CustomEvent) => {
      applyCustomColors(theme);
    };

    window.addEventListener('colorsChanged', handleColorsChanged as EventListener);
    return () => window.removeEventListener('colorsChanged', handleColorsChanged as EventListener);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('Toggling theme from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

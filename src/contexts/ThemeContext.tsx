
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
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    root.setAttribute('data-theme', theme);
    
    // Appliquer les couleurs personnalisées après le changement de thème
    const applyCustomColors = () => {
      const savedColors = localStorage.getItem("customColors");
      if (savedColors) {
        try {
          const colors = JSON.parse(savedColors);
          const isDark = theme === 'dark';
          
          // Appliquer les couleurs personnalisées
          root.style.setProperty('--app-background', isDark ? colors.backgroundDark : colors.background);
          root.style.setProperty('--app-text', isDark ? colors.textDark : colors.text);
          root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg);
          root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText);
          root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg);
          root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText);
          root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg);
          root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon);
          
          // Forcer l'application sur body
          document.body.style.backgroundColor = isDark ? colors.backgroundDark : colors.background;
          document.body.style.color = isDark ? colors.textDark : colors.text;
          
          console.log('🎨 Custom colors applied with theme:', theme);
        } catch (error) {
          console.error('Erreur lors de l\'application des couleurs:', error);
        }
      }
    };

    // Petit délai pour s'assurer que les variables CSS sont appliquées
    setTimeout(applyCustomColors, 100);
    
    console.log('🎨 Theme set to:', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('🔄 Toggling theme from', prevTheme, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

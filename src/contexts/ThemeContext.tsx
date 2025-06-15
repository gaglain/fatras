
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

  // Fonction pour appliquer les couleurs personnalisées IMMÉDIATEMENT
  const applyCustomColors = (currentTheme: Theme) => {
    const savedColors = localStorage.getItem('customColors');
    const root = document.documentElement;
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        const isDark = currentTheme === 'dark';
        
        // Application IMMÉDIATE et FORCÉE des couleurs
        root.style.setProperty('--app-background', isDark ? colors.backgroundDark : colors.background);
        root.style.setProperty('--app-text', isDark ? colors.textDark : colors.text);
        root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg);
        root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText);
        root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg);
        root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText);
        root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg);
        root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon);
        
        console.log('✅ Custom colors applied IMMEDIATELY for theme:', currentTheme, colors);
      } catch (error) {
        console.error('❌ Error applying custom colors:', error);
      }
    } else {
      // Appliquer les couleurs par défaut selon le thème
      const isDark = currentTheme === 'dark';
      root.style.setProperty('--app-background', isDark ? '#18181b' : '#ffffff');
      root.style.setProperty('--app-text', isDark ? '#ffffff' : '#18181b');
      root.style.setProperty('--app-card-bg', isDark ? '#22223a' : '#ffffff');
      root.style.setProperty('--app-card-text', isDark ? '#ffffff' : '#18181b');
      root.style.setProperty('--app-button-bg', isDark ? '#ffffff' : '#1632f4');
      root.style.setProperty('--app-button-text', isDark ? '#1632f4' : '#ffffff');
      root.style.setProperty('--app-chat-widget-bg', '#ec5f65');
      root.style.setProperty('--app-chat-widget-icon', '#ffffff');
      
      console.log('✅ Default colors applied for theme:', currentTheme);
    }
    
    // FORCER la re-application des styles
    root.style.setProperty('--force-update', Date.now().toString());
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // SUPPRIMER toutes les classes de thème
    root.classList.remove('light', 'dark');
    
    // AJOUTER la classe du thème actuel
    root.classList.add(theme);
    
    // SAUVEGARDER en localStorage
    localStorage.setItem('theme', theme);
    
    // APPLIQUER les couleurs personnalisées IMMÉDIATEMENT
    applyCustomColors(theme);
    
    // AJOUTER l'attribut data-theme pour forcer l'application CSS
    root.setAttribute('data-theme', theme);
    
    console.log('🎨 Theme applied:', theme, 'HTML classes:', root.className);
  }, [theme]);

  // Écouter les changements de couleurs personnalisées
  useEffect(() => {
    const handleColorsChanged = () => {
      console.log('🔄 Colors changed event detected, reapplying...');
      applyCustomColors(theme);
    };

    window.addEventListener('colorsChanged', handleColorsChanged);
    return () => window.removeEventListener('colorsChanged', handleColorsChanged);
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

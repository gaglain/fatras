
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
    
    console.log('🎨 Applying colors for theme:', currentTheme);
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        const isDark = currentTheme === 'dark';
        
        console.log('🔧 Custom colors found:', colors);
        
        // Application IMMÉDIATE et FORCÉE des couleurs
        root.style.setProperty('--app-background', isDark ? colors.backgroundDark : colors.background);
        root.style.setProperty('--app-text', isDark ? colors.textDark : colors.text);
        root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg);
        root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText);
        root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg);
        root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText);
        root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg || '#ec5f65');
        root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon || '#ffffff');
        
        // Appliquer aussi aux variables de fallback
        root.style.setProperty('--custom-background', isDark ? colors.backgroundDark : colors.background);
        root.style.setProperty('--custom-text', isDark ? colors.textDark : colors.text);
        root.style.setProperty('--custom-cardBg', isDark ? colors.cardBgDark : colors.cardBg);
        root.style.setProperty('--custom-cardText', isDark ? colors.cardTextDark : colors.cardText);
        
        console.log('✅ Custom colors applied successfully');
      } catch (error) {
        console.error('❌ Error applying custom colors:', error);
        applyDefaultColors(currentTheme);
      }
    } else {
      console.log('🔧 No custom colors found, applying defaults');
      applyDefaultColors(currentTheme);
    }
    
    // FORCER la re-application des styles
    root.style.setProperty('--force-update', Date.now().toString());
  };

  const applyDefaultColors = (currentTheme: Theme) => {
    const root = document.documentElement;
    const isDark = currentTheme === 'dark';
    
    console.log('🎨 Applying default colors for theme:', currentTheme);
    
    // Couleurs par défaut
    const defaultColors = {
      background: isDark ? '#18181b' : '#ffffff',
      text: isDark ? '#ffffff' : '#18181b',
      cardBg: isDark ? '#22223a' : '#ffffff',
      cardText: isDark ? '#ffffff' : '#18181b',
      buttonBg: isDark ? '#ffffff' : '#1632f4',
      buttonText: isDark ? '#1632f4' : '#ffffff',
      chatWidgetBg: '#ec5f65',
      chatWidgetIcon: '#ffffff'
    };
    
    // Appliquer les couleurs par défaut
    root.style.setProperty('--app-background', defaultColors.background);
    root.style.setProperty('--app-text', defaultColors.text);
    root.style.setProperty('--app-card-bg', defaultColors.cardBg);
    root.style.setProperty('--app-card-text', defaultColors.cardText);
    root.style.setProperty('--app-button-bg', defaultColors.buttonBg);
    root.style.setProperty('--app-button-text', defaultColors.buttonText);
    root.style.setProperty('--app-chat-widget-bg', defaultColors.chatWidgetBg);
    root.style.setProperty('--app-chat-widget-icon', defaultColors.chatWidgetIcon);
    
    // Variables de fallback
    root.style.setProperty('--custom-background', defaultColors.background);
    root.style.setProperty('--custom-text', defaultColors.text);
    root.style.setProperty('--custom-cardBg', defaultColors.cardBg);
    root.style.setProperty('--custom-cardText', defaultColors.cardText);
  };

  // Application initiale des couleurs
  useEffect(() => {
    console.log('🚀 ThemeProvider initializing with theme:', theme);
    
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
    
    console.log('✅ Theme applied successfully:', theme);
  }, [theme]);

  // Écouter les changements de couleurs personnalisées
  useEffect(() => {
    const handleColorsChanged = (event: CustomEvent) => {
      console.log('🔄 Colors changed event detected, reapplying...');
      applyCustomColors(theme);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'customColors') {
        console.log('🔄 Storage changed, reapplying colors...');
        applyCustomColors(theme);
      }
    };

    window.addEventListener('colorsChanged', handleColorsChanged as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('colorsChanged', handleColorsChanged as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  // Application immédiate au montage du composant
  useEffect(() => {
    // Délai court pour s'assurer que le DOM est prêt
    setTimeout(() => {
      console.log('🔄 Initial colors application...');
      applyCustomColors(theme);
    }, 50);
  }, []);

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

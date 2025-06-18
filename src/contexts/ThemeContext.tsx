
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
    const body = document.body;
    const isDark = currentTheme === 'dark';
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        
        // Application IMMÉDIATE et FORCÉE des couleurs avec !important via style direct
        const bgColor = isDark ? (colors.backgroundDark || '#18181b') : (colors.background || '#ffffff');
        const textColor = isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b');
        const cardBgColor = isDark ? (colors.cardBgDark || '#22223a') : (colors.cardBg || '#ffffff');
        const cardTextColor = isDark ? (colors.cardTextDark || '#ffffff') : (colors.cardText || '#18181b');
        const buttonBgColor = isDark ? (colors.buttonBgDark || '#ffffff') : (colors.buttonBg || '#1632f4');
        const buttonTextColor = isDark ? (colors.buttonTextDark || '#1632f4') : (colors.buttonText || '#ffffff');
        
        // Appliquer directement sur le body ET le root
        body.style.setProperty('background-color', bgColor, 'important');
        body.style.setProperty('color', textColor, 'important');
        
        // Variables CSS principales
        root.style.setProperty('--app-background', bgColor);
        root.style.setProperty('--app-text', textColor);
        root.style.setProperty('--app-card-bg', cardBgColor);
        root.style.setProperty('--app-card-text', cardTextColor);
        root.style.setProperty('--app-button-bg', buttonBgColor);
        root.style.setProperty('--app-button-text', buttonTextColor);
        root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg || '#ec5f65');
        root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon || '#ffffff');
        
        // Variables pour la sidebar personnalisable avec fallback approprié
        root.style.setProperty('--custom-sidebarBg', isDark ? (colors.sidebarBgDark || '#22223a') : (colors.sidebarBg || '#ffffff'));
        root.style.setProperty('--custom-sidebarText', isDark ? (colors.sidebarTextDark || '#ffffff') : (colors.sidebarText || '#18181b'));
        root.style.setProperty('--custom-sidebarActiveItemBg', isDark ? (colors.sidebarActiveItemBgDark || '#1632f4') : (colors.sidebarActiveItemBg || '#1632f4'));
        root.style.setProperty('--custom-sidebarActiveItemText', isDark ? (colors.sidebarActiveItemTextDark || '#ffffff') : (colors.sidebarActiveItemText || '#ffffff'));
        root.style.setProperty('--custom-sidebarIconLight', colors.sidebarIconLight || '#1632f4');
        root.style.setProperty('--custom-sidebarIconDark', colors.sidebarIconDark || '#ffffff');
        
        // Variables pour les notifications avec fallback approprié selon le thème
        root.style.setProperty('--custom-notificationBg', colors.notificationBg || bgColor);
        root.style.setProperty('--custom-notificationText', colors.notificationText || textColor);
        root.style.setProperty('--custom-notificationBorder', colors.notificationBorder || (isDark ? '#374151' : '#e5e7eb'));
        root.style.setProperty('--custom-notificationBadgeBg', colors.notificationBadgeBg || '#ef4444');
        root.style.setProperty('--custom-notificationBadgeText', colors.notificationBadgeText || '#ffffff');
        root.style.setProperty('--custom-notificationButtonBg', colors.notificationButtonBg || (isDark ? '#374151' : '#f3f4f6'));
        root.style.setProperty('--custom-notificationButtonText', colors.notificationButtonText || (isDark ? '#ffffff' : '#374151'));
        root.style.setProperty('--custom-notificationRedDot', colors.notificationRedDot || '#ef4444');
        
        console.log('✅ Custom colors applied IMMEDIATELY for theme:', currentTheme);
        console.log('🎨 Sidebar bg:', root.style.getPropertyValue('--custom-sidebarBg'));
        console.log('🔔 Notification bg:', root.style.getPropertyValue('--custom-notificationBg'));
      } catch (error) {
        console.error('❌ Error applying custom colors:', error);
        // En cas d'erreur, appliquer les couleurs par défaut
        applyDefaultColors(isDark, root, body);
      }
    } else {
      // Appliquer les couleurs par défaut selon le thème
      applyDefaultColors(isDark, root, body);
    }
    
    // FORCER la re-application des styles
    root.style.setProperty('--force-update', Date.now().toString());
  };

  const applyDefaultColors = (isDark: boolean, root: HTMLElement, body: HTMLElement) => {
    const defaultBg = isDark ? '#18181b' : '#ffffff';
    const defaultText = isDark ? '#ffffff' : '#18181b';
    
    // Appliquer directement sur le body
    body.style.setProperty('background-color', defaultBg, 'important');
    body.style.setProperty('color', defaultText, 'important');
    
    root.style.setProperty('--app-background', defaultBg);
    root.style.setProperty('--app-text', defaultText);
    root.style.setProperty('--app-card-bg', isDark ? '#22223a' : '#ffffff');
    root.style.setProperty('--app-card-text', isDark ? '#ffffff' : '#18181b');
    root.style.setProperty('--app-button-bg', isDark ? '#ffffff' : '#1632f4');
    root.style.setProperty('--app-button-text', isDark ? '#1632f4' : '#ffffff');
    root.style.setProperty('--app-chat-widget-bg', '#ec5f65');
    root.style.setProperty('--app-chat-widget-icon', '#ffffff');
    
    // Variables par défaut pour la sidebar
    root.style.setProperty('--custom-sidebarBg', isDark ? '#22223a' : '#ffffff');
    root.style.setProperty('--custom-sidebarText', isDark ? '#ffffff' : '#18181b');
    root.style.setProperty('--custom-sidebarActiveItemBg', '#1632f4');
    root.style.setProperty('--custom-sidebarActiveItemText', '#ffffff');
    root.style.setProperty('--custom-sidebarIconLight', '#1632f4');
    root.style.setProperty('--custom-sidebarIconDark', '#ffffff');
    
    // Variables par défaut pour les notifications
    root.style.setProperty('--custom-notificationBg', defaultBg);
    root.style.setProperty('--custom-notificationText', defaultText);
    root.style.setProperty('--custom-notificationBorder', isDark ? '#374151' : '#e5e7eb');
    root.style.setProperty('--custom-notificationBadgeBg', '#ef4444');
    root.style.setProperty('--custom-notificationBadgeText', '#ffffff');
    root.style.setProperty('--custom-notificationButtonBg', isDark ? '#374151' : '#f3f4f6');
    root.style.setProperty('--custom-notificationButtonText', isDark ? '#ffffff' : '#374151');
    root.style.setProperty('--custom-notificationRedDot', '#ef4444');
    
    console.log('✅ Default colors applied for theme:', isDark ? 'dark' : 'light');
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

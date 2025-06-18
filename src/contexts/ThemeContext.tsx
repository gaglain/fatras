
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

  // Fonction pour appliquer les couleurs personnalisées FORCÉMENT
  const applyCustomColors = (currentTheme: Theme) => {
    const savedColors = localStorage.getItem('customColors');
    const root = document.documentElement;
    const body = document.body;
    const isDark = currentTheme === 'dark';
    
    console.log('🎨 Applying custom colors for theme:', currentTheme);
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        
        // Application FORCÉE des couleurs principales
        const bgColor = isDark ? (colors.backgroundDark || '#18181b') : (colors.background || '#ffffff');
        const textColor = isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b');
        
        // Forcer l'application sur body ET root
        body.style.setProperty('background-color', bgColor, 'important');
        body.style.setProperty('color', textColor, 'important');
        
        // Variables CSS principales - FORCÉES avec setProperty
        root.style.setProperty('--app-background', bgColor, 'important');
        root.style.setProperty('--app-text', textColor, 'important');
        root.style.setProperty('--app-card-bg', isDark ? (colors.cardBgDark || '#22223a') : (colors.cardBg || '#ffffff'), 'important');
        root.style.setProperty('--app-card-text', isDark ? (colors.cardTextDark || '#ffffff') : (colors.cardText || '#18181b'), 'important');
        root.style.setProperty('--app-button-bg', isDark ? (colors.buttonBgDark || '#ffffff') : (colors.buttonBg || '#1632f4'), 'important');
        root.style.setProperty('--app-button-text', isDark ? (colors.buttonTextDark || '#1632f4') : (colors.buttonText || '#ffffff'), 'important');
        root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg || '#ec5f65', 'important');
        root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon || '#ffffff', 'important');
        
        // Variables SIDEBAR - TOUTES définies avec fallback
        root.style.setProperty('--custom-sidebarBg', isDark ? (colors.sidebarBgDark || '#22223a') : (colors.sidebarBg || '#ffffff'), 'important');
        root.style.setProperty('--custom-sidebarText', isDark ? (colors.sidebarTextDark || '#ffffff') : (colors.sidebarText || '#18181b'), 'important');
        root.style.setProperty('--custom-sidebarActiveItemBg', isDark ? (colors.sidebarActiveItemBgDark || '#1632f4') : (colors.sidebarActiveItemBg || '#1632f4'), 'important');
        root.style.setProperty('--custom-sidebarActiveItemText', isDark ? (colors.sidebarActiveItemTextDark || '#ffffff') : (colors.sidebarActiveItemText || '#ffffff'), 'important');
        root.style.setProperty('--custom-sidebarIconLight', colors.sidebarIconLight || '#1632f4', 'important');
        root.style.setProperty('--custom-sidebarIconDark', colors.sidebarIconDark || '#ffffff', 'important');
        
        // Variables NOTIFICATIONS - TOUTES définies avec fallback SMART selon le thème
        const notificationBg = colors.notificationBg || bgColor;
        const notificationText = colors.notificationText || textColor;
        const notificationBorder = colors.notificationBorder || (isDark ? '#374151' : '#e5e7eb');
        const notificationBadgeBg = colors.notificationBadgeBg || '#ef4444';
        const notificationBadgeText = colors.notificationBadgeText || '#ffffff';
        const notificationButtonBg = colors.notificationButtonBg || (isDark ? '#374151' : '#f3f4f6');
        const notificationButtonText = colors.notificationButtonText || (isDark ? '#ffffff' : '#374151');
        const notificationRedDot = colors.notificationRedDot || '#ef4444';
        
        // FORCER toutes les variables de notification
        root.style.setProperty('--custom-notificationBg', notificationBg, 'important');
        root.style.setProperty('--custom-notificationText', notificationText, 'important');
        root.style.setProperty('--custom-notificationBorder', notificationBorder, 'important');
        root.style.setProperty('--custom-notificationBadgeBg', notificationBadgeBg, 'important');
        root.style.setProperty('--custom-notificationBadgeText', notificationBadgeText, 'important');
        root.style.setProperty('--custom-notificationButtonBg', notificationButtonBg, 'important');
        root.style.setProperty('--custom-notificationButtonText', notificationButtonText, 'important');
        root.style.setProperty('--custom-notificationRedDot', notificationRedDot, 'important');
        
        console.log('✅ Custom colors applied with MAXIMUM FORCE');
        console.log('🔔 Notification variables:', {
          bg: notificationBg,
          text: notificationText,
          redDot: notificationRedDot,
          badgeBg: notificationBadgeBg
        });
        
      } catch (error) {
        console.error('❌ Error applying custom colors:', error);
        applyDefaultColors(isDark, root, body);
      }
    } else {
      applyDefaultColors(isDark, root, body);
    }
    
    // Force un refresh complet des styles
    const forceValue = Date.now().toString();
    root.style.setProperty('--force-update', forceValue);
    
    // Forcer un reflow du DOM
    document.body.offsetHeight;
  };

  const applyDefaultColors = (isDark: boolean, root: HTMLElement, body: HTMLElement) => {
    const defaultBg = isDark ? '#18181b' : '#ffffff';
    const defaultText = isDark ? '#ffffff' : '#18181b';
    
    body.style.setProperty('background-color', defaultBg, 'important');
    body.style.setProperty('color', defaultText, 'important');
    
    // Variables principales par défaut
    root.style.setProperty('--app-background', defaultBg, 'important');
    root.style.setProperty('--app-text', defaultText, 'important');
    root.style.setProperty('--app-card-bg', isDark ? '#22223a' : '#ffffff', 'important');
    root.style.setProperty('--app-card-text', isDark ? '#ffffff' : '#18181b', 'important');
    root.style.setProperty('--app-button-bg', isDark ? '#ffffff' : '#1632f4', 'important');
    root.style.setProperty('--app-button-text', isDark ? '#1632f4' : '#ffffff', 'important');
    root.style.setProperty('--app-chat-widget-bg', '#ec5f65', 'important');
    root.style.setProperty('--app-chat-widget-icon', '#ffffff', 'important');
    
    // Variables sidebar par défaut
    root.style.setProperty('--custom-sidebarBg', isDark ? '#22223a' : '#ffffff', 'important');
    root.style.setProperty('--custom-sidebarText', isDark ? '#ffffff' : '#18181b', 'important');
    root.style.setProperty('--custom-sidebarActiveItemBg', '#1632f4', 'important');
    root.style.setProperty('--custom-sidebarActiveItemText', '#ffffff', 'important');
    root.style.setProperty('--custom-sidebarIconLight', '#1632f4', 'important');
    root.style.setProperty('--custom-sidebarIconDark', '#ffffff', 'important');
    
    // Variables notifications par défaut
    root.style.setProperty('--custom-notificationBg', defaultBg, 'important');
    root.style.setProperty('--custom-notificationText', defaultText, 'important');
    root.style.setProperty('--custom-notificationBorder', isDark ? '#374151' : '#e5e7eb', 'important');
    root.style.setProperty('--custom-notificationBadgeBg', '#ef4444', 'important');
    root.style.setProperty('--custom-notificationBadgeText', '#ffffff', 'important');
    root.style.setProperty('--custom-notificationButtonBg', isDark ? '#374151' : '#f3f4f6', 'important');
    root.style.setProperty('--custom-notificationButtonText', isDark ? '#ffffff' : '#374151', 'important');
    root.style.setProperty('--custom-notificationRedDot', '#ef4444', 'important');
    
    console.log('✅ Default colors applied for theme:', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    root.setAttribute('data-theme', theme);
    
    // Application IMMÉDIATE et RÉPÉTÉE des couleurs
    applyCustomColors(theme);
    
    // Re-application après un délai pour s'assurer que tout est bien pris en compte
    setTimeout(() => {
      applyCustomColors(theme);
    }, 100);
    
    console.log('🎨 Theme applied with FORCE:', theme);
  }, [theme]);

  // Écouter les changements de couleurs personnalisées
  useEffect(() => {
    const handleColorsChanged = () => {
      console.log('🔄 Colors changed event - FORCING re-application...');
      setTimeout(() => {
        applyCustomColors(theme);
      }, 50);
      // Double application pour s'assurer
      setTimeout(() => {
        applyCustomColors(theme);
      }, 200);
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

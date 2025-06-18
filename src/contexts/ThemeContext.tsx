
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

  // Fonction pour appliquer les couleurs personnalisées IMMÉDIATEMENT et FORCÉMENT
  const applyCustomColors = (currentTheme: Theme) => {
    const savedColors = localStorage.getItem('customColors');
    const root = document.documentElement;
    const body = document.body;
    const isDark = currentTheme === 'dark';
    
    console.log('🎨 Applying custom colors for theme:', currentTheme);
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors);
        
        // Application FORCÉE des couleurs principales avec setProperty et importance maximale
        const bgColor = isDark ? (colors.backgroundDark || '#18181b') : (colors.background || '#ffffff');
        const textColor = isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b');
        const cardBgColor = isDark ? (colors.cardBgDark || '#22223a') : (colors.cardBg || '#ffffff');
        const cardTextColor = isDark ? (colors.cardTextDark || '#ffffff') : (colors.cardText || '#18181b');
        const buttonBgColor = isDark ? (colors.buttonBgDark || '#ffffff') : (colors.buttonBg || '#1632f4');
        const buttonTextColor = isDark ? (colors.buttonTextDark || '#1632f4') : (colors.buttonText || '#ffffff');
        
        // Forcer l'application sur body ET root avec maximum de priorité
        body.style.setProperty('background-color', bgColor, 'important');
        body.style.setProperty('color', textColor, 'important');
        
        // Variables CSS principales - FORCÉES
        root.style.setProperty('--app-background', bgColor, 'important');
        root.style.setProperty('--app-text', textColor, 'important');
        root.style.setProperty('--app-card-bg', cardBgColor, 'important');
        root.style.setProperty('--app-card-text', cardTextColor, 'important');
        root.style.setProperty('--app-button-bg', buttonBgColor, 'important');
        root.style.setProperty('--app-button-text', buttonTextColor, 'important');
        root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg || '#ec5f65', 'important');
        root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon || '#ffffff', 'important');
        
        // Variables SIDEBAR avec fallback intelligent selon le thème
        const sidebarBg = isDark ? (colors.sidebarBgDark || '#22223a') : (colors.sidebarBg || '#ffffff');
        const sidebarText = isDark ? (colors.sidebarTextDark || '#ffffff') : (colors.sidebarText || '#18181b');
        const sidebarActiveItemBg = isDark ? (colors.sidebarActiveItemBgDark || '#1632f4') : (colors.sidebarActiveItemBg || '#1632f4');
        const sidebarActiveItemText = isDark ? (colors.sidebarActiveItemTextDark || '#ffffff') : (colors.sidebarActiveItemText || '#ffffff');
        const sidebarIcon = isDark ? (colors.sidebarIconDark || '#ffffff') : (colors.sidebarIconLight || '#1632f4');
        
        root.style.setProperty('--custom-sidebarBg', sidebarBg, 'important');
        root.style.setProperty('--custom-sidebarText', sidebarText, 'important');
        root.style.setProperty('--custom-sidebarActiveItemBg', sidebarActiveItemBg, 'important');
        root.style.setProperty('--custom-sidebarActiveItemText', sidebarActiveItemText, 'important');
        root.style.setProperty('--custom-sidebarIconLight', colors.sidebarIconLight || '#1632f4', 'important');
        root.style.setProperty('--custom-sidebarIconDark', colors.sidebarIconDark || '#ffffff', 'important');
        
        // Variables NOTIFICATIONS avec fallback selon le thème - FORCÉES
        const notificationBg = colors.notificationBg || bgColor;
        const notificationText = colors.notificationText || textColor;
        const notificationBorder = colors.notificationBorder || (isDark ? '#374151' : '#e5e7eb');
        const notificationBadgeBg = colors.notificationBadgeBg || '#ef4444';
        const notificationBadgeText = colors.notificationBadgeText || '#ffffff';
        const notificationButtonBg = colors.notificationButtonBg || (isDark ? '#374151' : '#f3f4f6');
        const notificationButtonText = colors.notificationButtonText || (isDark ? '#ffffff' : '#374151');
        const notificationRedDot = colors.notificationRedDot || '#ef4444';
        
        root.style.setProperty('--custom-notificationBg', notificationBg, 'important');
        root.style.setProperty('--custom-notificationText', notificationText, 'important');
        root.style.setProperty('--custom-notificationBorder', notificationBorder, 'important');
        root.style.setProperty('--custom-notificationBadgeBg', notificationBadgeBg, 'important');
        root.style.setProperty('--custom-notificationBadgeText', notificationBadgeText, 'important');
        root.style.setProperty('--custom-notificationButtonBg', notificationButtonBg, 'important');
        root.style.setProperty('--custom-notificationButtonText', notificationButtonText, 'important');
        root.style.setProperty('--custom-notificationRedDot', notificationRedDot, 'important');
        
        console.log('✅ Custom colors applied FORCEFULLY');
        console.log('🔔 Notification bg applied:', notificationBg);
        console.log('🔴 Red dot color applied:', notificationRedDot);
        console.log('🔢 Badge bg applied:', notificationBadgeBg);
        
      } catch (error) {
        console.error('❌ Error applying custom colors:', error);
        applyDefaultColors(isDark, root, body);
      }
    } else {
      applyDefaultColors(isDark, root, body);
    }
    
    // Force un refresh des styles
    root.style.setProperty('--force-update', Date.now().toString());
  };

  const applyDefaultColors = (isDark: boolean, root: HTMLElement, body: HTMLElement) => {
    const defaultBg = isDark ? '#18181b' : '#ffffff';
    const defaultText = isDark ? '#ffffff' : '#18181b';
    
    // Application forcée des couleurs par défaut
    body.style.setProperty('background-color', defaultBg, 'important');
    body.style.setProperty('color', defaultText, 'important');
    
    root.style.setProperty('--app-background', defaultBg, 'important');
    root.style.setProperty('--app-text', defaultText, 'important');
    root.style.setProperty('--app-card-bg', isDark ? '#22223a' : '#ffffff', 'important');
    root.style.setProperty('--app-card-text', isDark ? '#ffffff' : '#18181b', 'important');
    root.style.setProperty('--app-button-bg', isDark ? '#ffffff' : '#1632f4', 'important');
    root.style.setProperty('--app-button-text', isDark ? '#1632f4' : '#ffffff', 'important');
    root.style.setProperty('--app-chat-widget-bg', '#ec5f65', 'important');
    root.style.setProperty('--app-chat-widget-icon', '#ffffff', 'important');
    
    // Variables par défaut pour la sidebar
    root.style.setProperty('--custom-sidebarBg', isDark ? '#22223a' : '#ffffff', 'important');
    root.style.setProperty('--custom-sidebarText', isDark ? '#ffffff' : '#18181b', 'important');
    root.style.setProperty('--custom-sidebarActiveItemBg', '#1632f4', 'important');
    root.style.setProperty('--custom-sidebarActiveItemText', '#ffffff', 'important');
    root.style.setProperty('--custom-sidebarIconLight', '#1632f4', 'important');
    root.style.setProperty('--custom-sidebarIconDark', '#ffffff', 'important');
    
    // Variables par défaut pour les notifications
    root.style.setProperty('--custom-notificationBg', defaultBg, 'important');
    root.style.setProperty('--custom-notificationText', defaultText, 'important');
    root.style.setProperty('--custom-notificationBorder', isDark ? '#374151' : '#e5e7eb', 'important');
    root.style.setProperty('--custom-notificationBadgeBg', '#ef4444', 'important');
    root.style.setProperty('--custom-notificationBadgeText', '#ffffff', 'important');
    root.style.setProperty('--custom-notificationButtonBg', isDark ? '#374151' : '#f3f4f6', 'important');
    root.style.setProperty('--custom-notificationButtonText', isDark ? '#ffffff' : '#374151', 'important');
    root.style.setProperty('--custom-notificationRedDot', '#ef4444', 'important');
    
    console.log('✅ Default colors applied FORCEFULLY for theme:', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // SUPPRIMER toutes les classes de thème
    root.classList.remove('light', 'dark');
    
    // AJOUTER la classe du thème actuel
    root.classList.add(theme);
    
    // SAUVEGARDER en localStorage
    localStorage.setItem('theme', theme);
    
    // DÉLAI pour s'assurer que le DOM est prêt puis appliquer IMMÉDIATEMENT
    setTimeout(() => {
      applyCustomColors(theme);
    }, 0);
    
    // AJOUTER l'attribut data-theme pour forcer l'application CSS
    root.setAttribute('data-theme', theme);
    
    console.log('🎨 Theme applied:', theme, 'HTML classes:', root.className);
  }, [theme]);

  // Écouter les changements de couleurs personnalisées
  useEffect(() => {
    const handleColorsChanged = () => {
      console.log('🔄 Colors changed event detected, reapplying FORCEFULLY...');
      // Délai court pour s'assurer que localStorage est mis à jour
      setTimeout(() => {
        applyCustomColors(theme);
      }, 50);
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


import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const useCustomColors = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const applyCustomColors = () => {
      const savedColors = localStorage.getItem("customColors");
      if (savedColors) {
        try {
          const colors = JSON.parse(savedColors);
          const root = document.documentElement;
          const isDark = theme === 'dark';
          
          console.log('🎨 Applying custom colors:', colors, 'Theme:', theme);
          
          // Appliquer les couleurs principales avec fallbacks
          root.style.setProperty('--app-background', isDark ? (colors.backgroundDark || '#0f0f0f') : (colors.background || '#ffffff'));
          root.style.setProperty('--app-text', isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b'));
          root.style.setProperty('--app-card-bg', isDark ? (colors.cardBgDark || '#1a1a1a') : (colors.cardBg || '#ffffff'));
          root.style.setProperty('--app-card-text', isDark ? (colors.cardTextDark || '#ffffff') : (colors.cardText || '#18181b'));
          root.style.setProperty('--app-button-bg', isDark ? (colors.buttonBgDark || '#ffffff') : (colors.buttonBg || '#1632f4'));
          root.style.setProperty('--app-button-text', isDark ? (colors.buttonTextDark || '#000000') : (colors.buttonText || '#ffffff'));
          root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg || '#1632f4');
          root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon || '#ffffff');
          
          // Appliquer les couleurs de notifications avec fallbacks
          root.style.setProperty('--notification-bg', colors.notificationBg || (isDark ? '#1a1a1a' : '#ffffff'));
          root.style.setProperty('--notification-text', colors.notificationText || (isDark ? '#ffffff' : '#18181b'));
          root.style.setProperty('--notification-border', colors.notificationBorder || (isDark ? '#374151' : '#e5e7eb'));
          root.style.setProperty('--notification-badge-bg', colors.notificationBadgeBg || '#ef4444');
          root.style.setProperty('--notification-badge-text', colors.notificationBadgeText || '#ffffff');
          root.style.setProperty('--notification-button-bg', colors.notificationButtonBg || (isDark ? '#374151' : '#f3f4f6'));
          root.style.setProperty('--notification-button-text', colors.notificationButtonText || (isDark ? '#ffffff' : '#374151'));
          root.style.setProperty('--notification-red-dot', colors.notificationRedDot || '#ef4444');
          
          // Appliquer les couleurs de la sidebar
          root.style.setProperty('--custom-sidebarBg', colors.sidebarBg || (isDark ? '#0f0f0f' : '#ffffff'));
          root.style.setProperty('--custom-sidebarText', colors.sidebarText || (isDark ? '#ffffff' : '#18181b'));
          root.style.setProperty('--custom-sidebarActiveItemBg', colors.sidebarActiveItemBg || '#1632f4');
          root.style.setProperty('--custom-sidebarActiveItemText', colors.sidebarActiveItemText || '#ffffff');
          root.style.setProperty('--custom-sidebarIconLight', colors.sidebarIconLight || '#1632f4');
          root.style.setProperty('--custom-sidebarIconDark', colors.sidebarIconDark || '#ffffff');
          
          // Forcer l'application sur body et html
          const bgColor = isDark ? (colors.backgroundDark || '#0f0f0f') : (colors.background || '#ffffff');
          const textColor = isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b');
          
          document.body.style.backgroundColor = bgColor;
          document.body.style.color = textColor;
          document.documentElement.style.backgroundColor = bgColor;
          document.documentElement.style.color = textColor;
          
          // Mettre à jour les variables CSS Tailwind
          root.style.setProperty('--background', isDark ? '222.2 84% 4.9%' : '0 0% 100%');
          root.style.setProperty('--foreground', isDark ? '210 40% 98%' : '222.2 84% 4.9%');
          root.style.setProperty('--card', isDark ? '222.2 84% 4.9%' : '0 0% 100%');
          root.style.setProperty('--card-foreground', isDark ? '210 40% 98%' : '222.2 84% 4.9%');
          
          // Déclencher un événement pour informer les autres composants
          window.dispatchEvent(new CustomEvent('customColorsApplied', { detail: colors }));
          
          console.log('✅ Custom colors applied successfully');
        } catch (error) {
          console.error('❌ Error applying custom colors:', error);
        }
      } else {
        console.log('🎨 No custom colors found, applying defaults');
        // Appliquer les couleurs par défaut
        const root = document.documentElement;
        const isDark = theme === 'dark';
        
        if (isDark) {
          root.style.setProperty('--app-background', '#0f0f0f');
          root.style.setProperty('--app-text', '#ffffff');
          root.style.setProperty('--app-card-bg', '#1a1a1a');
          root.style.setProperty('--app-card-text', '#ffffff');
          root.style.setProperty('--app-button-bg', '#ffffff');
          root.style.setProperty('--app-button-text', '#000000');
          root.style.setProperty('--custom-sidebarBg', '#0f0f0f');
          root.style.setProperty('--custom-sidebarText', '#ffffff');
          document.body.style.backgroundColor = '#0f0f0f';
          document.body.style.color = '#ffffff';
        } else {
          root.style.setProperty('--app-background', '#ffffff');
          root.style.setProperty('--app-text', '#18181b');
          root.style.setProperty('--app-card-bg', '#ffffff');
          root.style.setProperty('--app-card-text', '#18181b');
          root.style.setProperty('--app-button-bg', '#1632f4');
          root.style.setProperty('--app-button-text', '#ffffff');
          root.style.setProperty('--custom-sidebarBg', '#ffffff');
          root.style.setProperty('--custom-sidebarText', '#18181b');
          document.body.style.backgroundColor = '#ffffff';
          document.body.style.color = '#18181b';
        }
      }
    };

    // Appliquer immédiatement
    applyCustomColors();
    
    // Écouter les changements de couleurs
    const handleColorsChange = () => {
      console.log('🎨 Colors changed event received');
      applyCustomColors();
    };
    
    window.addEventListener('customColorsChanged', handleColorsChange);
    
    return () => {
      window.removeEventListener('customColorsChanged', handleColorsChange);
    };
  }, [theme]);

  // Fonction utilitaire pour obtenir les couleurs actuelles
  const getCurrentColors = () => {
    const savedColors = localStorage.getItem("customColors");
    if (savedColors) {
      try {
        return JSON.parse(savedColors);
      } catch (error) {
        console.error('Error parsing saved colors:', error);
      }
    }
    return null;
  };

  return { getCurrentColors };
};

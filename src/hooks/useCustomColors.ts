
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

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
          
          console.log('🎨 Applying custom colors with useCustomColors:', colors, 'Theme:', theme);
          
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
          
          // Forcer l'application sur body et html
          const bgColor = isDark ? (colors.backgroundDark || '#0f0f0f') : (colors.background || '#ffffff');
          const textColor = isDark ? (colors.textDark || '#ffffff') : (colors.text || '#18181b');
          
          document.body.style.backgroundColor = bgColor;
          document.body.style.color = textColor;
          document.documentElement.style.backgroundColor = bgColor;
          document.documentElement.style.color = textColor;
          
          // Mettre à jour les variables CSS Tailwind avec les bonnes valeurs
          const tailwindVars = {
            '--background': isDark ? '222.2 84% 4.9%' : '0 0% 100%',
            '--foreground': isDark ? '210 40% 98%' : '222.2 84% 4.9%',
            '--card': isDark ? '222.2 84% 4.9%' : '0 0% 100%',
            '--card-foreground': isDark ? '210 40% 98%' : '222.2 84% 4.9%',
            '--primary': '221 83% 53%',
            '--primary-foreground': isDark ? '255 255 255' : '210 40% 98%'
          };
          
          Object.entries(tailwindVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
          });
          
          console.log('✅ Custom colors applied successfully with useCustomColors');
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
          document.body.style.backgroundColor = '#0f0f0f';
          document.body.style.color = '#ffffff';
        } else {
          root.style.setProperty('--app-background', '#ffffff');
          root.style.setProperty('--app-text', '#18181b');
          root.style.setProperty('--app-card-bg', '#ffffff');
          root.style.setProperty('--app-card-text', '#18181b');
          root.style.setProperty('--app-button-bg', '#1632f4');
          root.style.setProperty('--app-button-text', '#ffffff');
          document.body.style.backgroundColor = '#ffffff';
          document.body.style.color = '#18181b';
        }
      }
    };

    // Appliquer immédiatement
    applyCustomColors();
    
    // Écouter les changements de couleurs avec tous les événements possibles
    const handleColorsChange = () => {
      console.log('🎨 Colors changed event received in useCustomColors');
      setTimeout(applyCustomColors, 50);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customColors') {
        console.log('💾 Storage change detected for customColors in useCustomColors');
        setTimeout(applyCustomColors, 50);
      }
    };
    
    window.addEventListener('customColorsChanged', handleColorsChange);
    window.addEventListener('customColorsApplied', handleColorsChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('customColorsChanged', handleColorsChange);
      window.removeEventListener('customColorsApplied', handleColorsChange);
      window.removeEventListener('storage', handleStorageChange);
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

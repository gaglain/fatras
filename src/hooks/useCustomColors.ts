
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
          
          console.log('🎨 Custom colors applied on theme change');
        } catch (error) {
          console.error('Erreur lors de l\'application des couleurs:', error);
        }
      }
    };

    applyCustomColors();
  }, [theme]);
};


import { useEffect } from 'react';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Initializing custom colors hook');
    
    const loadAndApplyColors = async () => {
      try {
        // Récupérer les couleurs personnalisées depuis localStorage
        const savedColors = localStorage.getItem('customColors');
        let colors = {
          primary: '#8B5CF6',
          secondary: '#3B82F6',
          accent: '#10B981',
          background: '#FFFFFF',
          text: '#18181B',
          backgroundDark: '#0f0f0f',
          textDark: '#ffffff',
          cardBg: '#ffffff',
          cardText: '#18181b',
          buttonBg: '#1632f4',
          buttonText: '#ffffff',
          cardBgDark: '#1a1a1a',
          cardTextDark: '#ffffff',
          buttonBgDark: '#ffffff',
          buttonTextDark: '#000000'
        };

        if (savedColors) {
          try {
            const parsedColors = JSON.parse(savedColors);
            colors = { ...colors, ...parsedColors };
            console.log('🎨 Loaded saved colors:', colors);
          } catch (e) {
            console.error('🎨 Error parsing saved colors:', e);
          }
        }

        // Détecter le thème actuel
        const isDark = document.documentElement.classList.contains('dark');
        console.log('🎨 Current theme is dark:', isDark);

        // Appliquer les couleurs aux variables CSS
        const root = document.documentElement;
        
        // Couleurs principales basées sur le thème
        root.style.setProperty('--app-background', isDark ? colors.backgroundDark : colors.background);
        root.style.setProperty('--app-text', isDark ? colors.textDark : colors.text);
        root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg);
        root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText);
        root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg);
        root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText);

        // Appliquer directement au body avec !important
        const bgColor = isDark ? colors.backgroundDark : colors.background;
        const textColor = isDark ? colors.textDark : colors.text;
        
        document.body.style.setProperty('background-color', bgColor, 'important');
        document.body.style.setProperty('color', textColor, 'important');
        document.documentElement.style.setProperty('background-color', bgColor, 'important');

        // Forcer l'application sur tous les éléments principaux
        const style = document.getElementById('custom-colors-override') || document.createElement('style');
        style.id = 'custom-colors-override';
        style.innerHTML = `
          body, #root, html {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
          }
          
          .card, [data-testid="card"] {
            background-color: ${isDark ? colors.cardBgDark : colors.cardBg} !important;
            color: ${isDark ? colors.cardTextDark : colors.cardText} !important;
          }
          
          .button, [data-testid="button"], button {
            background-color: ${isDark ? colors.buttonBgDark : colors.buttonBg} !important;
            color: ${isDark ? colors.buttonTextDark : colors.buttonText} !important;
          }
          
          main, section, article, div[class*="container"] {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
          }
          
          nav, header {
            background-color: ${isDark ? colors.cardBgDark : colors.cardBg} !important;
            color: ${isDark ? colors.cardTextDark : colors.cardText} !important;
          }
        `;
        
        if (!document.getElementById('custom-colors-override')) {
          document.head.appendChild(style);
        }

        console.log('🎨 Colors applied successfully', { bgColor, textColor, isDark });

      } catch (error) {
        console.error('🎨 Error in loadAndApplyColors:', error);
      }
    };

    // Charger les couleurs immédiatement
    loadAndApplyColors();

    // Écouter les changements de couleurs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customColors') {
        console.log('🎨 Colors changed in localStorage, reloading...');
        setTimeout(loadAndApplyColors, 100);
      }
    };

    // Écouter les changements de thème
    const handleThemeChange = () => {
      console.log('🎨 Theme changed, reapplying colors...');
      setTimeout(loadAndApplyColors, 100);
    };

    // Écouter les événements personnalisés
    const handleCustomColorsChanged = () => {
      console.log('🎨 Custom colors event detected, reapplying...');
      setTimeout(loadAndApplyColors, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customColorsChanged', handleCustomColorsChanged);
    window.addEventListener('customColorsApplied', handleCustomColorsChanged);
    
    // Observer les changements de classe sur documentElement pour détecter les changements de thème
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
        }
      });
    });
    
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customColorsChanged', handleCustomColorsChanged);
      window.removeEventListener('customColorsApplied', handleCustomColorsChanged);
      themeObserver.disconnect();
    };
  }, []);
};

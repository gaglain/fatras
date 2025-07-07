
import { useEffect } from 'react';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Custom colors hook started');
    
    const applyColors = () => {
      try {
        // Couleurs par défaut
        const defaultColors = {
          background: '#ffffff',
          text: '#18181b',
          cardBg: '#ffffff',
          cardText: '#18181b',
          buttonBg: '#1632f4',
          buttonText: '#ffffff',
          backgroundDark: '#0f0f0f',
          textDark: '#ffffff',
          cardBgDark: '#1a1a1a',
          cardTextDark: '#ffffff',
          buttonBgDark: '#ffffff',
          buttonTextDark: '#000000'
        };

        // Charger les couleurs sauvegardées
        const savedColors = localStorage.getItem('customColors');
        let colors = defaultColors;
        
        if (savedColors) {
          try {
            const parsed = JSON.parse(savedColors);
            colors = { ...defaultColors, ...parsed };
          } catch (e) {
            console.warn('Error parsing saved colors, using defaults');
          }
        }

        // Détecter le thème
        const isDark = document.documentElement.classList.contains('dark');
        
        // Appliquer les couleurs
        const bgColor = isDark ? colors.backgroundDark : colors.background;
        const textColor = isDark ? colors.textDark : colors.text;
        const cardBg = isDark ? colors.cardBgDark : colors.cardBg;
        const cardText = isDark ? colors.cardTextDark : colors.cardText;
        const buttonBg = isDark ? colors.buttonBgDark : colors.buttonBg;
        const buttonText = isDark ? colors.buttonTextDark : colors.buttonText;

        // Variables CSS
        document.documentElement.style.setProperty('--app-background', bgColor);
        document.documentElement.style.setProperty('--app-text', textColor);
        document.documentElement.style.setProperty('--app-card-bg', cardBg);
        document.documentElement.style.setProperty('--app-card-text', cardText);
        document.documentElement.style.setProperty('--app-button-bg', buttonBg);
        document.documentElement.style.setProperty('--app-button-text', buttonText);

        // Application directe
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;

        console.log('✅ Colors applied:', { bgColor, textColor, isDark });
      } catch (error) {
        console.error('❌ Error applying colors:', error);
      }
    };

    // Appliquer immédiatement
    applyColors();

    // Écouter les changements
    const handleColorChange = () => {
      setTimeout(applyColors, 50);
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'customColors') handleColorChange();
    });
    window.addEventListener('customColorsChanged', handleColorChange);

    // Observer les changements de thème
    const observer = new MutationObserver(() => {
      applyColors();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleColorChange);
      window.removeEventListener('customColorsChanged', handleColorChange);
      observer.disconnect();
    };
  }, []);
};

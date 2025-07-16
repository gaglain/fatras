
import { useEffect } from 'react';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Custom colors hook started');
    
    const applyColors = () => {
      try {
        // Couleurs par défaut
        const defaultColors = {
          background: 'hsl(0, 0%, 100%)',
          text: 'hsl(240, 10%, 3.9%)',
          backgroundDark: 'hsl(240, 10%, 3.9%)',
          textDark: 'hsl(0, 0%, 100%)'
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
        console.log('🎨 Theme detected:', isDark ? 'dark' : 'light');
        
        // Appliquer les couleurs selon le thème
        const activeColors = {
          background: isDark ? colors.backgroundDark : colors.background,
          text: isDark ? colors.textDark : colors.text
        };

        // Supprimer l'ancien style
        const existingStyle = document.getElementById('custom-colors-style');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Créer et injecter le nouveau style
        const style = document.createElement('style');
        style.id = 'custom-colors-style';
        style.innerHTML = `
          :root {
            --app-background: ${activeColors.background} !important;
            --app-text: ${activeColors.text} !important;
          }

          body, #root {
            background-color: var(--app-background) !important;
            color: var(--app-text) !important;
          }
        `;
        
        document.head.appendChild(style);

        console.log('✅ Colors applied successfully:', activeColors);
      } catch (error) {
        console.error('❌ Error applying colors:', error);
      }
    };

    // Appliquer immédiatement
    applyColors();

    // Écouter les changements de thème
    const handleThemeChange = () => {
      console.log('🎨 Theme change detected, reapplying colors');
      setTimeout(applyColors, 50);
    };

    // Observer les changements de classe sur l'élément HTML
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Écouter les événements personnalisés
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
      observer.disconnect();
    };
  }, []);
};


import { useEffect } from 'react';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Custom colors hook started');
    
    const applyColors = () => {
      try {
        // Couleurs par défaut étendues
        const defaultColors = {
          // Mode clair
          background: 'hsl(0, 0%, 100%)',
          text: 'hsl(240, 10%, 3.9%)',
          cardBg: 'hsl(0, 0%, 100%)',
          cardText: 'hsl(240, 10%, 3.9%)',
          buttonBg: 'hsl(221, 83%, 53%)',
          buttonText: 'hsl(0, 0%, 100%)',
          headerBg: 'hsl(0, 0%, 100%)',
          headerText: 'hsl(240, 10%, 3.9%)',
          sidebarBg: 'hsl(210, 40%, 98%)',
          sidebarText: 'hsl(215, 25%, 27%)',
          inputBg: 'hsl(0, 0%, 100%)',
          inputText: 'hsl(240, 10%, 3.9%)',
          borderColor: 'hsl(214, 32%, 91%)',
          messageBg: 'hsl(214, 100%, 97%)',
          messageText: 'hsl(221, 83%, 53%)',
          notificationBg: 'hsl(0, 0%, 100%)',
          notificationText: 'hsl(240, 10%, 3.9%)',
          widgetBg: 'hsl(221, 83%, 53%)',
          widgetText: 'hsl(0, 0%, 100%)',
          // Mode sombre
          backgroundDark: 'hsl(240, 10%, 3.9%)',
          textDark: 'hsl(0, 0%, 100%)',
          cardBgDark: 'hsl(240, 10%, 8%)',
          cardTextDark: 'hsl(0, 0%, 100%)',
          buttonBgDark: 'hsl(0, 0%, 100%)',
          buttonTextDark: 'hsl(240, 10%, 3.9%)',
          headerBgDark: 'hsl(240, 10%, 8%)',
          headerTextDark: 'hsl(0, 0%, 100%)',
          sidebarBgDark: 'hsl(240, 5%, 6%)',
          sidebarTextDark: 'hsl(240, 5%, 84%)',
          inputBgDark: 'hsl(240, 6%, 10%)',
          inputTextDark: 'hsl(0, 0%, 100%)',
          borderColorDark: 'hsl(240, 6%, 10%)',
          messageBgDark: 'hsl(221, 83%, 53%)',
          messageTextDark: 'hsl(210, 40%, 80%)',
          notificationBgDark: 'hsl(240, 10%, 8%)',
          notificationTextDark: 'hsl(0, 0%, 100%)',
          widgetBgDark: 'hsl(221, 83%, 53%)',
          widgetTextDark: 'hsl(0, 0%, 100%)'
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
        
        // Appliquer les couleurs selon le thème
        const activeColors = {
          background: isDark ? colors.backgroundDark : colors.background,
          text: isDark ? colors.textDark : colors.text,
          cardBg: isDark ? colors.cardBgDark : colors.cardBg,
          cardText: isDark ? colors.cardTextDark : colors.cardText,
          buttonBg: isDark ? colors.buttonBgDark : colors.buttonBg,
          buttonText: isDark ? colors.buttonTextDark : colors.buttonText,
          headerBg: isDark ? colors.headerBgDark : colors.headerBg,
          headerText: isDark ? colors.headerTextDark : colors.headerText,
          sidebarBg: isDark ? colors.sidebarBgDark : colors.sidebarBg,
          sidebarText: isDark ? colors.sidebarTextDark : colors.sidebarText,
          inputBg: isDark ? colors.inputBgDark : colors.inputBg,
          inputText: isDark ? colors.inputTextDark : colors.inputText,
          borderColor: isDark ? colors.borderColorDark : colors.borderColor,
          messageBg: isDark ? colors.messageBgDark : colors.messageBg,
          messageText: isDark ? colors.messageTextDark : colors.messageText,
          notificationBg: isDark ? colors.notificationBgDark : colors.notificationBg,
          notificationText: isDark ? colors.notificationTextDark : colors.notificationText,
          widgetBg: isDark ? colors.widgetBgDark : colors.widgetBg,
          widgetText: isDark ? colors.widgetTextDark : colors.widgetText
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
            --app-card-bg: ${activeColors.cardBg} !important;
            --app-card-text: ${activeColors.cardText} !important;
            --app-button-bg: ${activeColors.buttonBg} !important;
            --app-button-text: ${activeColors.buttonText} !important;
            --app-header-bg: ${activeColors.headerBg} !important;
            --app-header-text: ${activeColors.headerText} !important;
            --app-sidebar-bg: ${activeColors.sidebarBg} !important;
            --app-sidebar-text: ${activeColors.sidebarText} !important;
            --app-input-bg: ${activeColors.inputBg} !important;
            --app-input-text: ${activeColors.inputText} !important;
            --app-border: ${activeColors.borderColor} !important;
            --app-message-bg: ${activeColors.messageBg} !important;
            --app-message-text: ${activeColors.messageText} !important;
            --app-notification-bg: ${activeColors.notificationBg} !important;
            --app-notification-text: ${activeColors.notificationText} !important;
            --app-widget-bg: ${activeColors.widgetBg} !important;
            --app-widget-text: ${activeColors.widgetText} !important;
          }

          /* Application globale avec force */
          body, #root {
            background-color: var(--app-background) !important;
            color: var(--app-text) !important;
          }

          /* Header */
          .back-office-header, header {
            background-color: var(--app-header-bg) !important;
            color: var(--app-header-text) !important;
            border-color: var(--app-border) !important;
          }

          /* Sidebar */
          .sidebar, [data-sidebar], .app-sidebar {
            background-color: var(--app-sidebar-bg) !important;
            color: var(--app-sidebar-text) !important;
          }

          /* Cards */
          .card, [data-card] {
            background-color: var(--app-card-bg) !important;
            color: var(--app-card-text) !important;
            border-color: var(--app-border) !important;
          }

          /* Notifications - FIX TRANSPARENCY */
          .notification, [data-sonner-toaster], [data-sonner-toast] {
            background-color: var(--app-notification-bg) !important;
            color: var(--app-notification-text) !important;
            border: 1px solid var(--app-border) !important;
            backdrop-filter: none !important;
            z-index: 9999 !important;
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

    // Écouter les changements de couleurs personnalisées
    const handleColorChange = (e?: StorageEvent) => {
      if (window.location.pathname.startsWith('/front')) {
        console.log('🚫 Ignoring color change on frontend page');
        return;
      }
      setTimeout(applyColors, 50);
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'customColors') handleColorChange(e);
    });
    window.addEventListener('customColorsChanged', () => handleColorChange());

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

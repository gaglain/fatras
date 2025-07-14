
import { useEffect } from 'react';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Custom colors hook started');
    
    const applyColors = () => {
      try {
        // Couleurs par défaut étendues
        const defaultColors = {
          // Mode clair
          background: '#ffffff',
          text: '#18181b',
          cardBg: '#ffffff',
          cardText: '#18181b',
          buttonBg: '#1632f4',
          buttonText: '#ffffff',
          headerBg: '#ffffff',
          headerText: '#18181b',
          sidebarBg: '#f8fafc',
          sidebarText: '#374151',
          inputBg: '#ffffff',
          inputText: '#18181b',
          borderColor: '#e5e7eb',
          messageBg: '#f0f9ff',
          messageText: '#1e40af',
          notificationBg: '#ffffff',
          notificationText: '#18181b',
          widgetBg: '#1632f4',
          widgetText: '#ffffff',
          // Mode sombre
          backgroundDark: '#0f0f0f',
          textDark: '#ffffff',
          cardBgDark: '#1a1a1a',
          cardTextDark: '#ffffff',
          buttonBgDark: '#ffffff',
          buttonTextDark: '#000000',
          headerBgDark: '#1a1a1a',
          headerTextDark: '#ffffff',
          sidebarBgDark: '#111827',
          sidebarTextDark: '#d1d5db',
          inputBgDark: '#1f2937',
          inputTextDark: '#ffffff',
          borderColorDark: '#374151',
          messageBgDark: '#1e3a8a',
          messageTextDark: '#bfdbfe',
          notificationBgDark: '#1a1a1a',
          notificationTextDark: '#ffffff',
          widgetBgDark: '#1632f4',
          widgetTextDark: '#ffffff'
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

          /* Buttons */
          .btn-primary, .button-primary, [data-primary-button] {
            background-color: var(--app-button-bg) !important;
            color: var(--app-button-text) !important;
          }

          /* Inputs */
          input, textarea, select {
            background-color: var(--app-input-bg) !important;
            color: var(--app-input-text) !important;
            border-color: var(--app-border) !important;
          }

          /* Messagerie */
          .message, .chat-message, [data-message] {
            background-color: var(--app-message-bg) !important;
            color: var(--app-message-text) !important;
            border-color: var(--app-border) !important;
          }

          /* Widget de messagerie */
          .chat-widget, .messaging-widget, [data-chat-widget] {
            background-color: var(--app-widget-bg) !important;
            color: var(--app-widget-text) !important;
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

          /* Pop-up de notifications */
          .notification-popup, [data-notification-popup] {
            background-color: var(--app-notification-bg) !important;
            color: var(--app-notification-text) !important;
            border: 1px solid var(--app-border) !important;
            backdrop-filter: none !important;
            z-index: 9999 !important;
          }

          /* Dropdowns - FIX TRANSPARENCY */
          .dropdown-menu, [data-radix-popper-content-wrapper] {
            background-color: var(--app-card-bg) !important;
            color: var(--app-card-text) !important;
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

    // ISOLATION: Écouter SEULEMENT les changements de couleurs personnalisées, PAS les events de website
    const handleColorChange = (e?: StorageEvent) => {
      // Vérifier qu'on est bien sur une page admin pour éviter les conflits
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

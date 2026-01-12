import { useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
interface ManifestData {
  name: string;
  shortName: string;
  iconUrl: string;
  themeColor?: string;
  backgroundColor?: string;
}

export const usePWAManifest = () => {
  const updateManifest = useCallback((data: ManifestData) => {
    try {
      // Créer un nouveau manifest dynamique
      const manifest = {
        name: data.name,
        short_name: data.shortName,
        description: `${data.name} - Application de gestion professionnelle`,
        start_url: "/",
        display: "standalone",
        background_color: data.backgroundColor || "#ffffff",
        theme_color: data.themeColor || "#8b5cf6",
        icons: [
          {
            src: data.iconUrl || "/favicon.png?v=20251222",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: data.iconUrl || "/favicon.png?v=20251222",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        categories: ["business", "productivity"],
        orientation: "any",
        scope: "/"
      };

      // Convertir en blob et créer une URL
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(manifestBlob);

      // Mettre à jour ou créer le lien vers le manifest
      let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestURL;

      // Mettre à jour le favicon
      if (data.iconUrl) {
        let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'shortcut icon';
          document.head.appendChild(faviconLink);
        }
        faviconLink.href = data.iconUrl;
      }

      // Mettre à jour le titre
      document.title = data.name;

      // Mettre à jour les meta tags
      let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = data.themeColor || "#8b5cf6";

      // Sauvegarder dans localStorage pour persistance
      localStorage.setItem('pwaManifest', JSON.stringify(manifest));

      logger.debug('Manifest PWA mis à jour:', data.name);
      
      // Forcer une mise à jour du service worker si possible
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.update().catch(err => logger.debug('SW update skipped:', err));
          });
        });
      }

    } catch (error) {
      logger.error('Erreur lors de la mise à jour du manifest:', error);
    }
  }, []);

  const loadManifestFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('pwaManifest');
      if (stored) {
        const manifest = JSON.parse(stored);
        return manifest;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du manifest:', error);
    }
    return null;
  }, []);

  return {
    updateManifest,
    loadManifestFromStorage
  };
};

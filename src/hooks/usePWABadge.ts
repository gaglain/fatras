import { useEffect } from 'react';

/**
 * Hook pour gérer le badge PWA (nombre de notifications sur l'icône de l'app)
 * Utilise l'API Badging pour afficher le nombre de notifications non lues
 */
export const usePWABadge = (count: number) => {
  useEffect(() => {
    // Vérifier si l'API Badge est supportée
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      if (count > 0) {
        // Afficher le badge avec le nombre
        (navigator as any).setAppBadge(count).catch((error: Error) => {
          console.warn('Erreur lors de la mise à jour du badge PWA:', error);
        });
      } else {
        // Effacer le badge si pas de notifications
        (navigator as any).clearAppBadge().catch((error: Error) => {
          console.warn('Erreur lors de l\'effacement du badge PWA:', error);
        });
      }
    }
  }, [count]);
};

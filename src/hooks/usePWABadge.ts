import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook pour gérer le badge PWA (nombre de notifications sur l'icône de l'app)
 * Utilise l'API Badging pour afficher le nombre de notifications non lues
 */
export const usePWABadge = (count: number) => {
  useEffect(() => {
    logger.debug('PWA Badge - Count reçu:', count);
    
    // Vérifier si l'API Badge est supportée
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      logger.debug('PWA Badge - API Badge supportée');
      
      if (count > 0) {
        // Afficher le badge avec le nombre
        logger.debug('PWA Badge - Mise à jour du badge avec:', count);
        (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> }).setAppBadge(count)
          .then(() => {
            logger.debug('PWA Badge - Badge mis à jour avec succès:', count);
          })
          .catch((error: Error) => {
            logger.error('PWA Badge - Erreur lors de la mise à jour:', error);
          });
      } else {
        // Effacer le badge si pas de notifications
        logger.debug('PWA Badge - Effacement du badge');
        (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
          .then(() => {
            logger.debug('PWA Badge - Badge effacé avec succès');
          })
          .catch((error: Error) => {
            logger.error('PWA Badge - Erreur lors de l\'effacement:', error);
          });
      }
    } else {
      logger.warn('PWA Badge - API Badge non supportée sur ce navigateur/appareil');
    }
  }, [count]);
};

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

type BadgeApi = {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

async function getBadgeApi(): Promise<BadgeApi> {
  const nav = navigator as Navigator & BadgeApi;

  if (typeof nav.setAppBadge === 'function' || typeof nav.clearAppBadge === 'function') {
    return {
      setAppBadge: nav.setAppBadge?.bind(nav),
      clearAppBadge: nav.clearAppBadge?.bind(nav),
    };
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const reg = registration as ServiceWorkerRegistration & BadgeApi;
      return {
        setAppBadge: typeof reg.setAppBadge === 'function' ? reg.setAppBadge.bind(reg) : undefined,
        clearAppBadge: typeof reg.clearAppBadge === 'function' ? reg.clearAppBadge.bind(reg) : undefined,
      };
    } catch (error) {
      logger.debug('PWA Badge - Service worker ready indisponible:', error);
    }
  }

  return {};
}

/**
 * Hook pour gérer le badge PWA (nombre de notifications sur l'icône de l'app)
 * Utilise l'API Badging pour afficher le nombre de notifications non lues
 */
export const usePWABadge = (count: number) => {
  useEffect(() => {
    let isActive = true;

    const updateBadge = async () => {
      const { setAppBadge, clearAppBadge } = await getBadgeApi();
      if (!isActive) return;

      if (count > 0) {
        if (setAppBadge) {
          try {
            await setAppBadge(Math.max(0, Math.floor(count)));
            logger.debug('PWA Badge - Badge mis à jour:', count);
          } catch (error) {
            logger.error('PWA Badge - Erreur setAppBadge:', error);
          }
        }
      } else if (clearAppBadge) {
        try {
          await clearAppBadge();
          logger.debug('PWA Badge - Badge effacé');
        } catch (error) {
          logger.error('PWA Badge - Erreur clearAppBadge:', error);
        }
      }
    };

    void updateBadge();

    return () => {
      isActive = false;
    };
  }, [count]);
};


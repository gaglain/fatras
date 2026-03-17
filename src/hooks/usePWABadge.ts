import { useEffect } from 'react';
import { logger } from '@/lib/logger';

type BadgeApi = {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

type BadgeSyncMessage = {
  type: 'PWA_BADGE_SYNC';
  count: number;
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

async function postBadgeSyncMessage(count: number) {
  if (!('serviceWorker' in navigator)) return;

  const normalizedCount = Math.max(0, Math.floor(count));
  const message: BadgeSyncMessage = { type: 'PWA_BADGE_SYNC', count: normalizedCount };

  try {
    const targets = new Set<ServiceWorker>();

    if (navigator.serviceWorker.controller) {
      targets.add(navigator.serviceWorker.controller);
    }

    const registration = await navigator.serviceWorker.ready;
    if (registration.active) targets.add(registration.active);
    if (registration.waiting) targets.add(registration.waiting);
    if (registration.installing) targets.add(registration.installing);

    targets.forEach((worker) => worker.postMessage(message));
  } catch (error) {
    logger.debug('PWA Badge - Impossible de synchroniser via SW:', error);
  }
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

      const safeCount = Math.max(0, Math.floor(count));

      if (safeCount > 0) {
        if (setAppBadge) {
          try {
            await setAppBadge(safeCount);
            logger.debug('PWA Badge - Badge mis à jour:', safeCount);
          } catch (error) {
            logger.error('PWA Badge - Erreur setAppBadge:', error);
          }
        }

        await postBadgeSyncMessage(safeCount);
        return;
      }

      if (clearAppBadge) {
        try {
          await clearAppBadge();
          logger.debug('PWA Badge - Badge effacé');
        } catch (error) {
          logger.error('PWA Badge - Erreur clearAppBadge:', error);
        }
      }

      await postBadgeSyncMessage(0);
    };

    void updateBadge();

    return () => {
      isActive = false;
    };
  }, [count]);
};


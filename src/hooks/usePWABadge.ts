import { useEffect } from 'react';

/**
 * Hook pour gérer le badge PWA (nombre de notifications sur l'icône de l'app)
 * Utilise l'API Badging pour afficher le nombre de notifications non lues
 */
export const usePWABadge = (count: number) => {
  useEffect(() => {
    console.log('🔔 PWA Badge - Count reçu:', count);
    
    // Vérifier si l'API Badge est supportée
    if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
      console.log('✅ PWA Badge - API Badge supportée');
      
      if (count > 0) {
        // Afficher le badge avec le nombre
        console.log('📱 PWA Badge - Mise à jour du badge avec:', count);
        (navigator as any).setAppBadge(count)
          .then(() => {
            console.log('✅ PWA Badge - Badge mis à jour avec succès:', count);
          })
          .catch((error: Error) => {
            console.error('❌ PWA Badge - Erreur lors de la mise à jour:', error);
          });
      } else {
        // Effacer le badge si pas de notifications
        console.log('🧹 PWA Badge - Effacement du badge');
        (navigator as any).clearAppBadge()
          .then(() => {
            console.log('✅ PWA Badge - Badge effacé avec succès');
          })
          .catch((error: Error) => {
            console.error('❌ PWA Badge - Erreur lors de l\'effacement:', error);
          });
      }
    } else {
      console.warn('⚠️ PWA Badge - API Badge non supportée sur ce navigateur/appareil');
    }
  }, [count]);
};

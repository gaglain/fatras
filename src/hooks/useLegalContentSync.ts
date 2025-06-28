
import { useEffect, useCallback } from 'react';

export const useLegalContentSync = () => {
  const syncLegalContent = useCallback(() => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        const content = JSON.parse(savedContent);
        const event = new CustomEvent('legalContentUpdated', { detail: content });
        window.dispatchEvent(event);
        console.log('📄 Contenu légal synchronisé:', content);
      } catch (error) {
        console.error('Erreur sync contenu légal:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Synchroniser immédiatement au démarrage
    syncLegalContent();

    // Polling plus fréquent pour vérifier les changements
    const interval = setInterval(syncLegalContent, 500);

    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'legalContent') {
        setTimeout(syncLegalContent, 10);
      }
    };

    // Écouter les événements personnalisés
    const handleLegalSaved = () => {
      setTimeout(syncLegalContent, 10);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('legalContentSaved', handleLegalSaved);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('legalContentSaved', handleLegalSaved);
    };
  }, [syncLegalContent]);

  return { syncLegalContent };
};

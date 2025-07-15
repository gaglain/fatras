
import React, { useEffect } from 'react';

export const ForceFrontendSync: React.FC = () => {
  useEffect(() => {
    console.log('🔧 FORCE SYNC - Starting simple sync system');
    
    const applySyncNow = () => {
      try {
        // Charger les données depuis localStorage
        const savedDesign = localStorage.getItem('websiteDesign');
        let siteName = 'MusiConnect';
        
        if (savedDesign) {
          try {
            const design = JSON.parse(savedDesign);
            if (design?.siteName) {
              siteName = design.siteName;
              console.log('✅ FORCE SYNC - Site name loaded:', siteName);
            }
          } catch (e) {
            console.error('❌ FORCE SYNC - Design parse error:', e);
          }
        }
        
        // Mettre à jour le titre si différent
        if (document.title !== siteName) {
          document.title = siteName;
          console.log('📄 FORCE SYNC - Title updated to:', siteName);
        }
        
        // Déclencher les événements de synchronisation
        const events = ['websiteDesignUpdated', 'websiteDesignSaved', 'websiteSettingsUpdated'];
        events.forEach(eventName => {
          const event = new CustomEvent(eventName, { detail: { siteName } });
          window.dispatchEvent(event);
        });
        
      } catch (error) {
        console.error('❌ FORCE SYNC - Error:', error);
      }
    };
    
    // Application immédiate
    applySyncNow();
    
    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign' || event.key === 'websiteSettings') {
        console.log('📡 FORCE SYNC - Storage change detected for:', event.key);
        setTimeout(applySyncNow, 100);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérification périodique toutes les 3 secondes
    const interval = setInterval(applySyncNow, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      console.log('🧹 FORCE SYNC - Cleanup completed');
    };
  }, []);
  
  return null;
};

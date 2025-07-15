
import React, { useEffect } from 'react';

export const ForceFrontendSync: React.FC = () => {
  useEffect(() => {
    console.log('🔧 FORCE SYNC - Starting GLOBAL sync system');
    
    const applySyncNow = () => {
      try {
        // 1. Charger les données depuis localStorage
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
        
        // 2. FORCER le titre de la page IMMÉDIATEMENT si différent
        if (document.title !== siteName) {
          document.title = siteName;
          console.log('📄 FORCE SYNC - Title updated to:', siteName);
        }
        
        // 3. FORCER la mise à jour de TOUS les éléments de nom de site
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
        siteNameElements.forEach((el, index) => {
          if (el.textContent !== siteName) {
            const oldText = el.textContent;
            el.textContent = siteName;
            console.log(`✅ FORCE SYNC - Updated site name element ${index + 1} from "${oldText}" to: ${siteName}`);
          }
        });
        
        // 4. FORCER les h1 avec "Bienvenue sur"
        const welcomeHeaders = document.querySelectorAll('h1');
        welcomeHeaders.forEach((h1, index) => {
          if (h1.textContent?.includes('Bienvenue sur') && !h1.textContent.includes(siteName)) {
            const newText = `Bienvenue sur ${siteName}`;
            h1.textContent = newText;
            console.log(`✅ FORCE SYNC - Updated welcome header ${index + 1} to: ${newText}`);
          }
        });
        
        console.log('✅ FORCE SYNC - Sync cycle completed');
        
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
        setTimeout(applySyncNow, 10);
      }
    };
    
    // Écouter les événements customisés
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('📡 FORCE SYNC - Custom event detected:', event.type);
      setTimeout(applySyncNow, 10);
    };
    
    // Écouter TOUS les événements possibles
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvent as EventListener);
    window.addEventListener('websiteDesignSaved', handleCustomEvent as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvent as EventListener);
    
    // Vérification périodique toutes les 2 secondes
    const interval = setInterval(applySyncNow, 2000);
    
    // Nettoyage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('websiteDesignSaved', handleCustomEvent as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvent as EventListener);
      clearInterval(interval);
      console.log('🧹 FORCE SYNC - Cleanup completed');
    };
  }, []);
  
  return null;
};

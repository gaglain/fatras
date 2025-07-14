
import React, { useEffect } from 'react';

export const ForceFrontendSync: React.FC = () => {
  useEffect(() => {
    console.log('🔧 FORCE SYNC - Starting AGGRESSIVE sync');
    
    const applySyncNow = () => {
      try {
        // 1. Charger les données depuis localStorage
        const savedDesign = localStorage.getItem('websiteDesign');
        const savedSettings = localStorage.getItem('websiteSettings');
        
        let siteName = 'MusiConnect'; // valeur par défaut
        let design: any = null;
        
        // Priorité ABSOLUE au design
        if (savedDesign) {
          try {
            design = JSON.parse(savedDesign);
            if (design?.siteName) {
              siteName = design.siteName;
              console.log('✅ FORCE SYNC - Design loaded, siteName:', siteName);
            }
          } catch (e) {
            console.error('❌ FORCE SYNC - Design parse error:', e);
          }
        }
        
        // Fallback vers settings SEULEMENT si pas de design
        if (!siteName || siteName === 'MusiConnect') {
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              if (settings?.siteName) {
                siteName = settings.siteName;
                console.log('✅ FORCE SYNC - Settings loaded, siteName:', siteName);
              }
            } catch (e) {
              console.error('❌ FORCE SYNC - Settings parse error:', e);
            }
          }
        }
        
        console.log('🎯 FORCE SYNC - Final siteName:', siteName);
        
        // 2. FORCER le titre de la page IMMÉDIATEMENT
        if (document.title !== siteName) {
          document.title = siteName;
          console.log('📄 FORCE SYNC - Title FORCED to:', siteName);
        }
        
        // 3. FORCER la mise à jour de TOUS les éléments du nom du site
        const updateSiteNameElements = () => {
          const selectors = [
            '.site-name',
            '[data-site-name]',
            '[class*="site-name"]',
            'h1:contains("Bienvenue sur")'
          ];
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`🔍 FORCE SYNC - Found ${elements.length} elements for selector: ${selector}`);
            
            elements.forEach((el, index) => {
              if (el.textContent !== siteName && !el.textContent?.includes('Bienvenue sur')) {
                const oldText = el.textContent;
                el.textContent = siteName;
                console.log(`✅ FORCE SYNC - Updated element ${index + 1} from "${oldText}" to: ${siteName}`);
              } else if (el.textContent?.includes('Bienvenue sur')) {
                const oldText = el.textContent;
                el.textContent = `Bienvenue sur ${siteName}`;
                console.log(`✅ FORCE SYNC - Updated welcome text from "${oldText}" to: Bienvenue sur ${siteName}`);
              }
            });
          });
          
          // FORCER aussi les h1 avec "Bienvenue sur"
          const welcomeHeaders = document.querySelectorAll('h1');
          welcomeHeaders.forEach(h1 => {
            if (h1.textContent?.includes('Bienvenue sur')) {
              h1.textContent = `Bienvenue sur ${siteName}`;
              console.log('✅ FORCE SYNC - Updated welcome header to:', h1.textContent);
            }
          });
        };
        
        // 4. Appliquer les styles si design disponible
        if (design && design.logo) {
          const updateLogos = () => {
            const logoElements = document.querySelectorAll('.site-logo, img[class*="logo"]');
            logoElements.forEach(logo => {
              const imgEl = logo as HTMLImageElement;
              if (imgEl.src !== design.logo) {
                imgEl.src = design.logo;
                imgEl.style.display = 'block';
                console.log('🖼️ FORCE SYNC - Logo updated');
              }
            });
          };
          updateLogos();
        }
        
        // 5. Appliquer les changements plusieurs fois pour être VRAIMENT sûr
        updateSiteNameElements();
        setTimeout(updateSiteNameElements, 50);
        setTimeout(updateSiteNameElements, 200);
        setTimeout(updateSiteNameElements, 500);
        setTimeout(updateSiteNameElements, 1000);
        
        console.log('✅ FORCE SYNC - All changes applied AGGRESSIVELY');
        
      } catch (error) {
        console.error('❌ FORCE SYNC - Error:', error);
      }
    };
    
    // Application immédiate ET répétée
    applySyncNow();
    setTimeout(applySyncNow, 100);
    setTimeout(applySyncNow, 500);
    setTimeout(applySyncNow, 1000);
    
    // Écouter les changements
    const handleDataChange = (event?: any) => {
      console.log('📡 FORCE SYNC - Data change detected:', event?.type || 'manual');
      setTimeout(applySyncNow, 10); // Plus rapide
    };
    
    // Écouter TOUS les événements possibles
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('websiteDesignUpdated', handleDataChange);
    window.addEventListener('websiteDesignSaved', handleDataChange);
    window.addEventListener('websiteSettingsUpdated', handleDataChange);
    
    // Vérification périodique agressive
    const aggressiveInterval = setInterval(applySyncNow, 2000); // Toutes les 2 secondes
    
    // Nettoyage
    return () => {
      console.log('🧹 FORCE SYNC - Cleanup');
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('websiteDesignUpdated', handleDataChange);
      window.removeEventListener('websiteDesignSaved', handleDataChange);
      window.removeEventListener('websiteSettingsUpdated', handleDataChange);
      clearInterval(aggressiveInterval);
    };
  }, []);
  
  return null;
};

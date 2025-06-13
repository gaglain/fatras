
import { useState, useEffect } from 'react';
import { navigationData, defaultOpenSections, MenuItem } from '@/data/navigationData';

export const useNavigation = () => {
  const [navigation, setNavigation] = useState<MenuItem[]>(navigationData);
  const [openSections, setOpenSections] = useState<string[]>(defaultOpenSections);

  useEffect(() => {
    const loadMenuConfiguration = () => {
      try {
        const saved = localStorage.getItem('menuConfiguration');
        if (saved) {
          const config = JSON.parse(saved);
          if (config.menuItems && Array.isArray(config.menuItems)) {
            setNavigation(config.menuItems);
            console.log('Configuration du menu chargée depuis localStorage');
          }
        } else {
          // Si pas de configuration sauvée, utiliser les données par défaut
          setNavigation(navigationData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration du menu:', error);
        // En cas d'erreur, on utilise la configuration par défaut
        setNavigation(navigationData);
      }
    };

    loadMenuConfiguration();

    // Écouter les changements de configuration
    const handleMenuConfigUpdate = () => {
      loadMenuConfiguration();
    };

    window.addEventListener('menuConfigUpdated', handleMenuConfigUpdate);

    return () => {
      window.removeEventListener('menuConfigUpdated', handleMenuConfigUpdate);
    };
  }, []);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  return {
    navigation,
    openSections,
    toggleSection,
    setNavigation
  };
};

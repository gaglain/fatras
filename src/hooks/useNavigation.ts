
import { useState, useEffect } from 'react';
import { navigationData, defaultOpenSections, MenuItem } from '@/data/navigationData';

export const useNavigation = () => {
  const [navigation, setNavigation] = useState<MenuItem[]>(navigationData);
  const [openSections, setOpenSections] = useState<string[]>(defaultOpenSections);

  useEffect(() => {
    // Forcer l'utilisation des nouvelles données et effacer l'ancien cache
    localStorage.removeItem('menuConfiguration');
    setNavigation(navigationData);
    console.log('Menu forcé avec les nouvelles données:', navigationData);
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

import { useState, useEffect } from 'react';
import { navigationData, defaultOpenSections, MenuItem } from '@/data/navigationData';

export const useNavigation = () => {
  const [navigation, setNavigation] = useState<MenuItem[]>(navigationData);
  const [openSections, setOpenSections] = useState<string[]>(defaultOpenSections);

  useEffect(() => {
    localStorage.removeItem('menuConfiguration');
    setNavigation(navigationData);
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

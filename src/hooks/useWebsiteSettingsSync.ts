import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
}

export const useWebsiteSettingsSync = () => {
  const lastSyncHash = useRef<string>('');
  const syncInProgress = useRef(false);

  const syncSettingsChanges = useCallback(() => {
    if (syncInProgress.current) return;
    
    const savedSettings = localStorage.getItem('websiteSettings');
    if (!savedSettings) return;
    
    // Prevent redundant syncs with same data
    if (lastSyncHash.current === savedSettings) return;
    
    syncInProgress.current = true;
    
    try {
      const settings: WebsiteSettings = JSON.parse(savedSettings);
      
      logger.debug('Applying website settings');
      
      // Update title only if changed
      if (settings.siteName && document.title !== settings.siteName) {
        document.title = settings.siteName;
      }
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      
      const currentDescription = metaDescription.getAttribute('content');
      if (currentDescription !== settings.siteDescription) {
        metaDescription.setAttribute('content', settings.siteDescription || '');
      }
      
      // Update site name elements efficiently
      const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
      siteNameElements.forEach(el => {
        if (el.textContent !== settings.siteName) {
          el.textContent = settings.siteName;
        }
      });
      
      lastSyncHash.current = savedSettings;
      
      logger.debug('Settings synchronized successfully');
    } catch (error) {
      logger.error('Settings sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial sync
    syncSettingsChanges();

    // Reduced frequency polling
    const interval = setInterval(syncSettingsChanges, 5000); // 5 seconds instead of 100ms

    // Storage change listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings' && !syncInProgress.current) {
        setTimeout(syncSettingsChanges, 100);
      }
    };

    const handleSettingsSaved = () => {
      if (!syncInProgress.current) {
        setTimeout(syncSettingsChanges, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
    };
  }, [syncSettingsChanges]);

  return { syncSettingsChanges };
};

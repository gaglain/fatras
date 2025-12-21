import { useMemo } from 'react';

export type DomainType = 'public' | 'booking' | 'preview';

interface DomainConfig {
  type: DomainType;
  isPublicSite: boolean;
  isBookingSite: boolean;
  hostname: string;
}

/**
 * Hook to detect which domain the app is running on
 * - fatras.net → public site (shows /front content)
 * - booking.fatras.net → booking/auth site
 * - *.lovable.app → preview (current behavior)
 */
export const useDomainRouting = (): DomainConfig => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    console.log('🌐 Domain routing - hostname:', hostname);
    
    // Check for booking subdomain first
    if (hostname === 'booking.fatras.net' || hostname.startsWith('booking.')) {
      console.log('🎫 Detected booking domain');
      return {
        type: 'booking',
        isPublicSite: false,
        isBookingSite: true,
        hostname,
      };
    }
    
    // Check for main public domain (fatras.net without subdomain)
    if (hostname === 'fatras.net' || hostname === 'www.fatras.net') {
      console.log('🌍 Detected public domain');
      return {
        type: 'public',
        isPublicSite: true,
        isBookingSite: false,
        hostname,
      };
    }
    
    // Preview/development mode (lovable.app or localhost)
    console.log('🔧 Detected preview/development domain');
    return {
      type: 'preview',
      isPublicSite: false,
      isBookingSite: false,
      hostname,
    };
  }, []);
};

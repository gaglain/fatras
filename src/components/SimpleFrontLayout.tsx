import React, { useEffect } from 'react';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { GoogleAnalytics } from './GoogleAnalytics';
import { useWebsiteSEO } from '@/hooks/useWebsiteSEO';

interface SimpleFrontLayoutProps {
  children: React.ReactNode;
}

export const SimpleFrontLayout: React.FC<SimpleFrontLayoutProps> = ({ children }) => {
  const { config } = useWebsiteConfig();
  const { seoSettings } = useWebsiteSEO();

  console.log('🎯 SimpleFrontLayout - Current siteName:', config.siteName);
  console.log('📊 GA ID:', seoSettings?.google_analytics_id);

  return (
    <div className="min-h-screen flex flex-col">
      {seoSettings?.google_analytics_id && (
        <GoogleAnalytics 
          measurementId={seoSettings.google_analytics_id} 
          enabled={true} 
        />
      )}
      <SimpleFrontNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

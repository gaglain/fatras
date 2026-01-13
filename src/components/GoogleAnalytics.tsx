
import React, { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId?: string;
  enabled?: boolean;
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId, enabled = true }) => {
  useEffect(() => {
    if (!measurementId || !enabled) return;

    // Charger le script Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialiser Google Analytics
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(script2);

    return () => {
      // Nettoyer les scripts si nécessaire
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [measurementId, enabled]);

  return null;
};

// Fonction utilitaire pour envoyer des événements
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Fonction pour envoyer des pages vues
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

import { useEffect } from 'react';

interface FacebookPixelProps {
  pixelId?: string;
  enabled?: boolean;
}

export const FacebookPixel: React.FC<FacebookPixelProps> = ({ pixelId, enabled = true }) => {
  useEffect(() => {
    if (!pixelId || !enabled) return;

    // Éviter les doublons
    if ((window as any).fbq) {
      return;
    }

    // Charger le script Facebook Pixel
    const script = document.createElement('script');
    script.id = 'fb-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Ajouter le noscript pour le fallback
    const noscript = document.createElement('noscript');
    noscript.id = 'fb-pixel-noscript';
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    return () => {
      const existingScript = document.getElementById('fb-pixel-script');
      const existingNoscript = document.getElementById('fb-pixel-noscript');
      if (existingScript) document.head.removeChild(existingScript);
      if (existingNoscript) document.body.removeChild(existingNoscript);
    };
  }, [pixelId, enabled]);

  return null;
};

// Fonctions utilitaires pour le tracking
export const trackFBEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters);
  }
};

export const trackFBCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, parameters);
  }
};

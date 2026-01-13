import React, { useEffect, useState } from 'react';

interface DeferredAnalyticsProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

/**
 * Composant qui charge les scripts Analytics de manière différée
 * pour améliorer le FCP et LCP.
 * Les scripts sont chargés après l'interaction utilisateur ou après un délai.
 */
export const DeferredAnalytics: React.FC<DeferredAnalyticsProps> = ({
  googleAnalyticsId,
  facebookPixelId
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Charger après interaction utilisateur ou après 3 secondes
    const loadOnInteraction = () => {
      setShouldLoad(true);
      cleanup();
    };

    const timeoutId = setTimeout(() => {
      setShouldLoad(true);
      cleanup();
    }, 3000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', loadOnInteraction);
      window.removeEventListener('click', loadOnInteraction);
      window.removeEventListener('touchstart', loadOnInteraction);
      window.removeEventListener('keydown', loadOnInteraction);
    };

    // Écouter les interactions
    window.addEventListener('scroll', loadOnInteraction, { once: true, passive: true });
    window.addEventListener('click', loadOnInteraction, { once: true });
    window.addEventListener('touchstart', loadOnInteraction, { once: true, passive: true });
    window.addEventListener('keydown', loadOnInteraction, { once: true });

    return cleanup;
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    // Charger Google Analytics
    if (googleAnalyticsId && !(window as any).gtag) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}');
      `;
      document.head.appendChild(script2);
    }

    // Charger Facebook Pixel
    if (facebookPixelId && !(window as any).fbq) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }, [shouldLoad, googleAnalyticsId, facebookPixelId]);

  return null;
};

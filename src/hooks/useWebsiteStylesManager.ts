
import { useRef, useCallback } from 'react';

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  textColor: string;
  linkColor: string;
}

export const useWebsiteStylesManager = () => {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  const applyStyles = useCallback((design: SiteDesign) => {
    console.log('🎨 Applying CSS styles for:', design.siteName);
    
    // Nettoyer les anciens styles
    if (styleElementRef.current) {
      styleElementRef.current.remove();
      styleElementRef.current = null;
    }
    
    // Supprimer tous les styles existants avec cet ID
    document.querySelectorAll('#unified-website-styles').forEach(style => style.remove());
    
    // Créer le nouveau style
    const style = document.createElement('style');
    style.id = 'unified-website-styles';
    styleElementRef.current = style;
    
    style.innerHTML = `
      :root {
        --site-primary-color: ${design.primaryColor} !important;
        --site-secondary-color: ${design.secondaryColor} !important;
        --site-accent-color: ${design.accentColor} !important;
        --site-text-color: ${design.textColor} !important;
        --site-link-color: ${design.linkColor} !important;
        --site-header-bg: ${design.headerBg} !important;
        --site-footer-bg: ${design.footerBg} !important;
      }
      
      .front-header, [data-theme-element="header"], header {
        background: ${design.headerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .front-footer, [data-theme-element="footer"], footer {
        background: ${design.footerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .front-text, [data-theme-element="text"] {
        color: ${design.textColor} !important;
      }
      
      .front-link, [data-theme-element="link"], .front-navigation a, nav a {
        color: ${design.linkColor} !important;
      }
      
      .front-button, .front-primary, button[class*="primary"] {
        background-color: ${design.primaryColor} !important;
        color: white !important;
      }
      
      .front-button:hover, button[class*="primary"]:hover {
        background-color: ${design.secondaryColor} !important;
      }

      .site-logo, img[class*="logo"] {
        max-height: 40px !important;
        width: auto !important;
        display: ${design.logo ? 'block' : 'none'} !important;
      }
      
      .site-name, [data-site-name], [class*="site-name"] {
        color: ${design.textColor} !important;
        font-weight: bold !important;
        font-size: 1.25rem !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('✅ CSS styles applied successfully');
  }, []);

  const cleanup = useCallback(() => {
    if (styleElementRef.current) {
      styleElementRef.current.remove();
      styleElementRef.current = null;
    }
  }, []);

  return { applyStyles, cleanup };
};

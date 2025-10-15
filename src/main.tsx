
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Global menu normalization listener to keep data consistent and prevent crashes
if (typeof window !== 'undefined') {
  window.addEventListener('websiteMenuUpdated', (event: any) => {
    try {
      const clean = (s: any) => {
        if (typeof s !== 'string') return s;
        if (s.startsWith('/http://') || s.startsWith('/https://') || s.startsWith('///')) {
          return s.slice(1);
        }
        return s;
      };
      const arr = Array.isArray(event.detail) ? event.detail : [];
      const normalized = arr.map((item: any) => {
        const rawPath = item.path || item.url || '/';
        const rawUrl = item.url || item.path || '/';
        const path = clean(rawPath);
        const url = clean(rawUrl);
        const isExternal = (path?.startsWith('http') || path?.startsWith('//') || url?.startsWith('http') || url?.startsWith('//'));
        return {
          ...item,
          path,
          url,
          visible: item.visible ?? item.is_visible ?? true,
          order: item.order ?? item.menu_order ?? 0,
          target: item.target || (isExternal ? '_blank' : '_self'),
        };
      });
      // Persist in both keys for compatibility
      localStorage.setItem('websiteMenu', JSON.stringify(normalized));
      localStorage.setItem('website_menu', JSON.stringify(normalized));
      // Emit a secondary normalized event for consumers
      window.dispatchEvent(new CustomEvent('menuUpdated', { detail: normalized }));
    } catch (err) {
      console.error('❌ Global menu normalization failed, clearing corrupted data:', err);
      localStorage.removeItem('websiteMenu');
      localStorage.removeItem('website_menu');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

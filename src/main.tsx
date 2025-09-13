
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Global menu normalization listener to keep data consistent and prevent crashes
if (typeof window !== 'undefined') {
  window.addEventListener('websiteMenuUpdated', (event: any) => {
    try {
      const arr = Array.isArray(event.detail) ? event.detail : [];
      const normalized = arr.map((item: any) => ({
        ...item,
        path: item.path || item.url || '/',
        url: item.url || item.path || '/',
        visible: item.visible ?? item.is_visible ?? true,
        order: item.order ?? item.menu_order ?? 0,
        target: item.target || '_self',
      }));
      // Persist in both keys for compatibility
      localStorage.setItem('websiteMenu', JSON.stringify(normalized));
      localStorage.setItem('website_menu', JSON.stringify(normalized));
      // Emit a secondary normalized event for consumers
      window.dispatchEvent(new CustomEvent('menuUpdated', { detail: normalized }));
    } catch (err) {
      console.error('❌ Global menu normalization failed:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

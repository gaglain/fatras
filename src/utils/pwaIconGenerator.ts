/**
 * Utilitaire pour générer les icônes PWA aux bonnes tailles
 * et les uploader dans Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';

interface IconSize {
  width: number;
  height: number;
  name: string;
}

const ICON_SIZES: IconSize[] = [
  { width: 192, height: 192, name: 'icon-192.png' },
  { width: 512, height: 512, name: 'icon-512.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' }, // Pour iOS
];

/**
 * Redimensionne une image à la taille spécifiée
 */
async function resizeImage(file: File, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Impossible de créer le contexte canvas'));
      return;
    }

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en blob PNG
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Impossible de créer le blob'));
        }
      }, 'image/png', 1.0);
    };

    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload un fichier d'icône dans Supabase Storage
 */
async function uploadIcon(blob: Blob, filename: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('app-assets')
    .upload(`pwa-icons/${filename}`, blob, {
      cacheControl: '31536000', // 1 an de cache
      upsert: true, // Remplacer si existe déjà
      contentType: 'image/png'
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('app-assets')
    .getPublicUrl(`pwa-icons/${filename}`);

  return publicUrl;
}

/**
 * Génère toutes les icônes PWA nécessaires depuis un fichier image
 */
export async function generatePWAIcons(file: File): Promise<{
  icon192: string;
  icon512: string;
  appleIcon: string;
}> {
  console.log('🎨 Génération des icônes PWA...');

  try {
    const urls: Record<string, string> = {};

    // Générer chaque taille d'icône
    for (const size of ICON_SIZES) {
      console.log(`📐 Redimensionnement ${size.width}x${size.height}...`);
      const resizedBlob = await resizeImage(file, size.width, size.height);
      
      console.log(`⬆️ Upload ${size.name}...`);
      const url = await uploadIcon(resizedBlob, size.name);
      urls[size.name] = url;
      
      console.log(`✅ ${size.name}: ${url}`);
    }

    return {
      icon192: urls['icon-192.png'],
      icon512: urls['icon-512.png'],
      appleIcon: urls['apple-touch-icon.png']
    };
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes PWA:', error);
    throw error;
  }
}

/**
 * Met à jour le manifest PWA avec les nouvelles URLs d'icônes
 * Crée un manifest dynamique avec les vraies URLs des icônes
 */
export function updatePWAManifest(config: {
  name: string;
  shortName: string;
  icon192Url: string;
  icon512Url: string;
  appleIconUrl: string;
  themeColor?: string;
  backgroundColor?: string;
}) {
  console.log('📝 Mise à jour du manifest PWA dynamique...');

  const themeColor = config.themeColor || '#8b5cf6';
  const backgroundColor = config.backgroundColor || '#ffffff';

  // Créer le manifest dynamique avec les vraies URLs des icônes
  const manifest = {
    name: config.name,
    short_name: config.shortName,
    description: `${config.name} - Application de gestion professionnelle`,
    start_url: "/",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    orientation: "any",
    scope: "/",
    icons: [
      {
        src: config.icon192Url,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: config.icon512Url,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity"]
  };

  // Convertir en blob et créer une URL dynamique
  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(manifestBlob);

  // Mettre à jour le lien du manifest
  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    document.head.appendChild(manifestLink);
  }
  manifestLink.href = manifestURL;

  // Sauvegarder dans localStorage pour persistance
  localStorage.setItem('pwaManifest', JSON.stringify(manifest));
  localStorage.setItem('pwaConfig', JSON.stringify({
    name: config.name,
    shortName: config.shortName,
    icon192: config.icon192Url,
    icon512: config.icon512Url,
    appleIcon: config.appleIconUrl,
    themeColor,
    backgroundColor
  }));

  // Mettre à jour le favicon
  let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = config.icon192Url;
  faviconLink.type = 'image/png';

  // Ajouter les meta tags pour iOS
  updateIOSMetaTags(config.appleIconUrl, config.name, themeColor);

  // Mettre à jour le titre
  document.title = config.name;

  // Mettre à jour la couleur de thème
  let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = themeColor;

  console.log('✅ PWA configuré avec succès:', config.name);
  console.log('📱 Pour voir les changements: supprimez l\'app de l\'écran d\'accueil et rajoutez-la');
}

/**
 * Met à jour les meta tags spécifiques à iOS
 */
function updateIOSMetaTags(appleIconUrl: string, appName: string, themeColor?: string) {
  // Apple touch icon
  let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
  if (!appleTouchIcon) {
    appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    document.head.appendChild(appleTouchIcon);
  }
  appleTouchIcon.href = appleIconUrl;

  // Apple mobile web app capable
  let appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement;
  if (!appleCapable) {
    appleCapable = document.createElement('meta');
    appleCapable.name = 'apple-mobile-web-app-capable';
    document.head.appendChild(appleCapable);
  }
  appleCapable.content = 'yes';

  // Apple status bar style
  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
  if (!appleStatusBar) {
    appleStatusBar = document.createElement('meta');
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    document.head.appendChild(appleStatusBar);
  }
  appleStatusBar.content = 'black-translucent';

  // Apple title
  let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
  if (!appleTitle) {
    appleTitle = document.createElement('meta');
    appleTitle.name = 'apple-mobile-web-app-title';
    document.head.appendChild(appleTitle);
  }
  appleTitle.content = appName;

  console.log('✅ Meta tags iOS mis à jour');
}

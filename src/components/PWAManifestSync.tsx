import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updatePWAManifest } from '@/utils/pwaIconGenerator';

/**
 * Composant qui synchronise automatiquement les meta tags PWA avec les paramètres de l'app
 * Ce composant doit être monté au niveau racine de l'application
 * Il charge les paramètres PWA sans nécessiter d'authentification
 */
export const PWAManifestSync: React.FC = () => {
  useEffect(() => {
    const syncPWASettings = async () => {
      try {
        // Charger les paramètres PWA depuis la base de données (sans filtre user_id pour l'app partagée)
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', [
            'company_name',
            'pwa_icon_192',
            'pwa_icon_512',
            'pwa_apple_icon',
            'theme_color',
            'background_color'
          ])
          .limit(10);

        if (error) {
          console.error('Erreur lors du chargement des paramètres PWA:', error);
          return;
        }

        // Construire l'objet de configuration
        const settings = data?.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {} as Record<string, string>);

        if (settings && settings.pwa_icon_192 && settings.pwa_icon_512 && settings.pwa_apple_icon) {
          const appName = settings.company_name || 'Fatras Booking';
          
          // Mettre à jour les meta tags PWA
          updatePWAManifest({
            name: appName,
            shortName: appName.length > 12 ? appName.substring(0, 12) : appName,
            icon192Url: settings.pwa_icon_192,
            icon512Url: settings.pwa_icon_512,
            appleIconUrl: settings.pwa_apple_icon,
            themeColor: settings.theme_color || '#8b5cf6',
            backgroundColor: settings.background_color || '#ffffff'
          });
          
          console.log('✅ Meta tags PWA synchronisés depuis la base de données');
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation PWA:', error);
      }
    };

    // Synchroniser au montage
    syncPWASettings();

    // Écouter les changements de paramètres
    const handleSettingsChange = () => {
      syncPWASettings();
    };

    window.addEventListener('companySettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('companySettingsChanged', handleSettingsChange);
    };
  }, []);

  return null;
};

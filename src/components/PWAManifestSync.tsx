import { useEffect } from 'react';
import { usePWAManifest } from '@/hooks/usePWAManifest';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant qui synchronise automatiquement le manifest PWA avec les paramètres de l'app
 * Ce composant doit être monté au niveau racine de l'application
 */
export const PWAManifestSync: React.FC = () => {
  const { updateManifest } = usePWAManifest();
  const { user } = useAuth();

  useEffect(() => {
    const syncManifest = async () => {
      if (!user?.id) return;

      try {
        // Charger les paramètres depuis la base de données
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['company_name', 'company_logo', 'company_favicon', 'app_icon']);

        if (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
          return;
        }

        // Construire l'objet de configuration
        const settings = data?.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {} as Record<string, string>);

        if (settings) {
          const appName = settings.company_name || 'Fatras Booking';
          const iconUrl = settings.app_icon || settings.company_logo || settings.company_favicon || '/favicon.ico';

          // Mettre à jour le manifest
          updateManifest({
            name: appName,
            shortName: appName.length > 12 ? appName.substring(0, 12) : appName,
            iconUrl: iconUrl,
            themeColor: '#8b5cf6',
            backgroundColor: '#ffffff'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation du manifest:', error);
      }
    };

    // Synchroniser au montage
    syncManifest();

    // Écouter les changements de paramètres
    const handleSettingsChange = () => {
      syncManifest();
    };

    window.addEventListener('companySettingsChanged', handleSettingsChange);

    return () => {
      window.removeEventListener('companySettingsChanged', handleSettingsChange);
    };
  }, [user, updateManifest]);

  return null;
};

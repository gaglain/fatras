import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAppSettings = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setSettings({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return;
      }

      const settingsMap = data?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as Record<string, string>) || {};

      setSettings(settingsMap);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const setSetting = async (key: string, value: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour modifier les paramètres');
      return false;
    }

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert([{
          user_id: user.id,
          setting_key: key,
          setting_value: value
        }], {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde du paramètre:', error);
        toast.error('Erreur lors de la sauvegarde du paramètre');
        return false;
      }

      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du paramètre:', error);
      toast.error('Erreur lors de la sauvegarde du paramètre');
      return false;
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    setSetting,
    getSetting,
    refetch: fetchSettings
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RoadshowSettings {
  default_departure_address: string;
}

const DEFAULT_SETTINGS: RoadshowSettings = {
  default_departure_address: ''
};

export const useRoadshowSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<RoadshowSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', ['default_departure_address']);

      if (error) throw error;

      const settingsMap: RoadshowSettings = { ...DEFAULT_SETTINGS };
      data?.forEach(item => {
        if (item.setting_key === 'default_departure_address') {
          settingsMap.default_departure_address = item.setting_value;
        }
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching roadshow settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof RoadshowSettings, value: string) => {
    if (!user) return false;

    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('setting_key', key)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('app_settings')
          .update({ setting_value: value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('app_settings')
          .insert({
            user_id: user.id,
            setting_key: key,
            setting_value: value
          });

        if (error) throw error;
      }

      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error updating roadshow setting:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    updateSetting,
    fetchSettings
  };
};

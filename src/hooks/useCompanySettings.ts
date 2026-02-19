import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";

export interface CompanySettings {
  name: string;
  logo: string;
  favicon?: string;
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    name: "Fatras",
    logo: "/logo.svg",
    favicon: "/favicon.png"
  });


  const normalizeFavicon = (value?: string) => {
    const fallback = '/favicon.png?v=20260219';
    if (!value) return fallback;
    const v = String(value).trim();
    if (!v) return fallback;
    // Keep data URLs / absolute URLs intact
    if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
    // Migrate legacy ico reference
    if (v.includes('favicon.ico')) return fallback;
    return v;
  };

  // Charger les paramètres depuis Supabase (globaux ou par utilisateur)
  useEffect(() => {
    const loadFromSupabase = async () => {
      // D'abord essayer de charger depuis localStorage pour un affichage immédiat
      try {
        const stored = localStorage.getItem("companySettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.logo || parsed.name) {
            setSettings((old) => ({ ...old, ...parsed }));
            applySettings(parsed);
          }
        }
      } catch (err) {
        logger.error("Error loading from localStorage:", err);
      }

      // Ensuite charger depuis Supabase (les paramètres globaux sont prioritaires)
      try {
        // Charger les paramètres globaux de l'app (sans filtre user_id)
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['company_name', 'company_logo', 'company_favicon']);

        if (error) throw error;

        const loadedSettings = data?.reduce((acc, item) => {
          switch (item.setting_key) {
            case 'company_name':
              acc.name = item.setting_value;
              break;
            case 'company_logo':
              acc.logo = item.setting_value;
              break;
            case 'company_favicon':
              acc.favicon = item.setting_value;
              break;
          }
          return acc;
        }, {
          name: "Fatras",
          logo: "/logo.svg",
          favicon: "/favicon.png"
        });

        if (loadedSettings && (loadedSettings.name !== "Fatras" || loadedSettings.logo !== "/logo.svg")) {
          setSettings(loadedSettings);
          localStorage.setItem('companySettings', JSON.stringify(loadedSettings));
          applySettings(loadedSettings);
        }
      } catch (error) {
        logger.error('Error loading company settings:', error);
      }
    };

    loadFromSupabase();
  }, [user?.id]);

  const applySettings = (newSettings: CompanySettings) => {
    // Appliquer le favicon (prioritaire)
    if (newSettings.favicon) {
      const normalizedFavicon = normalizeFavicon(newSettings.favicon);

      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = normalizedFavicon;

      // Sauvegarder dans localStorage pour le chargement initial (index.html)
      try {
        localStorage.setItem('customFavicon', normalizedFavicon);

        const stored = localStorage.getItem('companySettings');
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.favicon = normalizedFavicon;
        localStorage.setItem('companySettings', JSON.stringify(parsed));
      } catch {
        // ignore
      }

      logger.debug('Favicon appliqué:', normalizedFavicon);
    }

    if (newSettings.name) {
      document.title = newSettings.name;
    }
  };

  // Écoute des mises à jour envoyées par la page Préférences
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setSettings((old) => ({ ...old, ...detail }));
      applySettings(detail);
    };
    window.addEventListener("companySettingsChanged", onChange as any);
    return () => window.removeEventListener("companySettingsChanged", onChange as any);
  }, []);

  return settings;
}

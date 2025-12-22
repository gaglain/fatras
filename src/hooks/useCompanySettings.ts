import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CompanySettings {
  name: string;
  logo: string;
  favicon?: string;
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    name: "MusiConnect",
    logo: "/logo.svg",
    favicon: ""
  });

  // Charger les paramètres depuis Supabase quand l'utilisateur change
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!user?.id) {
        // Si pas d'utilisateur, charger depuis localStorage
        try {
          const stored = localStorage.getItem("companySettings");
          if (stored) {
            const parsed = JSON.parse(stored);
            setSettings((old) => ({ ...old, ...parsed }));
            applySettings(parsed);
          }
        } catch (err) {
          console.error("Error loading from localStorage:", err);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .eq('user_id', user.id)
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
          name: "MusiConnect",
          logo: "/logo.svg",
          favicon: ""
        });

        if (loadedSettings) {
          setSettings(loadedSettings);
          localStorage.setItem('companySettings', JSON.stringify(loadedSettings));
          applySettings(loadedSettings);
        }
      } catch (error) {
        console.error('Error loading company settings:', error);
      }
    };

    loadFromSupabase();
  }, [user?.id]);

  const applySettings = (newSettings: CompanySettings) => {
    // Appliquer le favicon (prioritaire)
    if (newSettings.favicon) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = newSettings.favicon;
      // Sauvegarder dans localStorage pour le chargement initial (index.html)
      try { 
        localStorage.setItem('customFavicon', newSettings.favicon);
        // Mettre à jour companySettings dans localStorage aussi
        const stored = localStorage.getItem('companySettings');
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.favicon = newSettings.favicon;
        localStorage.setItem('companySettings', JSON.stringify(parsed));
      } catch {}
      console.log('✅ Favicon appliqué:', newSettings.favicon);
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

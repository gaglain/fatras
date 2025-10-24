import { useEffect, useState } from "react";

export interface CompanySettings {
  name: string;
  logo: string;
  favicon?: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: "MusiConnect",
    logo: "/logo.svg",
    favicon: ""
  });

  useEffect(() => {
    const applyFavicon = (url?: string) => {
      if (!url) return;
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
      try { localStorage.setItem('customFavicon', url); } catch {}
    };

    // Chargement depuis le localStorage
    const stored = localStorage.getItem("companySettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((old) => ({ ...old, ...parsed }));
        if (parsed?.favicon) applyFavicon(parsed.favicon);
        if (parsed?.name) document.title = parsed.name;
      } catch (err) {
        // Ignore/Keep defaults
      }
    }

    // Appliquer un favicon personnalisé persistant si présent
    try {
      const savedFav = localStorage.getItem('customFavicon');
      if (savedFav) applyFavicon(savedFav);
    } catch {}

    // Mettre à jour le titre si non défini
    if (settings?.name) document.title = settings.name;

    // Écoute des mises à jour envoyées par la page Préférences
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setSettings((old) => ({ ...old, ...detail }));
      if ((detail as any).favicon) applyFavicon((detail as any).favicon);
      if ((detail as any).name) document.title = (detail as any).name;
    };
    window.addEventListener("companySettingsChanged", onChange as any);
    return () => window.removeEventListener("companySettingsChanged", onChange as any);
  }, [settings?.name]);

  return settings;
}

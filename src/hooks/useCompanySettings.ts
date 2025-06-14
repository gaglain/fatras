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
    const stored = localStorage.getItem("companySettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings((old) => ({ ...old, ...parsed }));
      } catch (err) {
        // Ignore/Keep defaults
      }
    }
    // Listen to updates dispatched by Preferences page
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setSettings((old) => ({ ...old, ...detail }));
    };
    window.addEventListener("companySettingsChanged", onChange as any);
    return () => window.removeEventListener("companySettingsChanged", onChange as any);
  }, []);

  return settings;
}

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generatePWAIcons, updatePWAManifest } from '@/utils/pwaIconGenerator';

export interface CompanySettings {
  name: string;
  logo: string;
  favicon: string;
  appIcon: string;
  pwaIcon192: string;
  pwaIcon512: string;
  pwaAppleIcon: string;
}

export const defaultCompanySettings: CompanySettings = {
  name: "Fatras Booking",
  logo: "",
  favicon: "",
  appIcon: "",
  pwaIcon192: "",
  pwaIcon512: "",
  pwaAppleIcon: ""
};

const SETTING_KEY_MAP: Record<string, keyof CompanySettings> = {
  company_name: 'name',
  company_logo: 'logo',
  company_favicon: 'favicon',
  app_icon: 'appIcon',
  pwa_icon_192: 'pwaIcon192',
  pwa_icon_512: 'pwaIcon512',
  pwa_apple_icon: 'pwaAppleIcon',
};

const REVERSE_KEY_MAP: Record<string, string> = {
  name: 'company_name',
  logo: 'company_logo',
  favicon: 'company_favicon',
  appIcon: 'app_icon',
  pwaIcon192: 'pwa_icon_192',
  pwaIcon512: 'pwa_icon_512',
  pwaAppleIcon: 'pwa_apple_icon',
};

export function applyFavicon(url: string) {
  try {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/x-icon';
    link.href = url;
    try { localStorage.setItem('customFavicon', url); } catch {}
  } catch {}
}

function applyPWAManifest(settings: CompanySettings) {
  if (settings.pwaIcon192 && settings.pwaIcon512 && settings.pwaAppleIcon) {
    updatePWAManifest({
      name: settings.name,
      shortName: settings.name.length > 12 ? settings.name.substring(0, 12) : settings.name,
      icon192Url: settings.pwaIcon192,
      icon512Url: settings.pwaIcon512,
      appleIconUrl: settings.pwaAppleIcon,
      themeColor: '#8b5cf6',
      backgroundColor: '#ffffff'
    });
  }
}

function persistAndNotify(settings: CompanySettings) {
  try { localStorage.setItem('companySettings', JSON.stringify(settings)); } catch {}
  if (settings.favicon) applyFavicon(settings.favicon);
  if (settings.name) document.title = settings.name;
  applyPWAManifest(settings);
  window.dispatchEvent(new CustomEvent('companySettingsChanged', { detail: settings }));
}

export async function loadCompanySettings(userId: string): Promise<CompanySettings | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .in('setting_key', Object.keys(SETTING_KEY_MAP));
    if (error) throw error;

    const settings = { ...defaultCompanySettings };
    data?.forEach(item => {
      const key = SETTING_KEY_MAP[item.setting_key];
      if (key) (settings as any)[key] = item.setting_value;
    });

    persistAndNotify(settings);
    return settings;
  } catch {
    return null;
  }
}

export async function saveCompanySettings(userId: string, settings: CompanySettings) {
  const entries = Object.entries(REVERSE_KEY_MAP).map(([field, key]) => ({
    setting_key: key,
    setting_value: (settings as any)[field] || ''
  }));

  for (const entry of entries) {
    const { error } = await supabase.from('app_settings').upsert(
      { user_id: userId, ...entry },
      { onConflict: 'user_id,setting_key' }
    );
    if (error) throw error;
  }
  persistAndNotify(settings);
}

export async function uploadFile(userId: string, type: 'logo' | 'favicon' | 'appIcon', file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large');
  const fileExt = file.name.split('.').pop();
  const filePath = `company/${type}_${userId}_${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('app-assets').upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('app-assets').getPublicUrl(filePath);

  const settingKey = type === 'logo' ? 'company_logo' : type === 'favicon' ? 'company_favicon' : 'app_icon';
  await supabase.from('app_settings').upsert(
    { user_id: userId, setting_key: settingKey, setting_value: publicUrl },
    { onConflict: 'user_id,setting_key' }
  );
  return publicUrl;
}

export async function uploadPWAIcons(userId: string, file: File, currentSettings: CompanySettings): Promise<CompanySettings> {
  if (!file.type.startsWith('image/')) throw new Error('Invalid image');
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large');

  const { icon192, icon512, appleIcon } = await generatePWAIcons(file);
  const updated = { ...currentSettings, pwaIcon192: icon192, pwaIcon512: icon512, pwaAppleIcon: appleIcon };

  const entries = [
    { setting_key: 'pwa_icon_192', setting_value: icon192 },
    { setting_key: 'pwa_icon_512', setting_value: icon512 },
    { setting_key: 'pwa_apple_icon', setting_value: appleIcon },
  ];
  for (const entry of entries) {
    const { error } = await supabase.from('app_settings').upsert(
      { user_id: userId, ...entry },
      { onConflict: 'user_id,setting_key' }
    );
    if (error) throw error;
  }
  applyPWAManifest(updated);
  window.dispatchEvent(new CustomEvent('companySettingsChanged', { detail: updated }));
  return updated;
}

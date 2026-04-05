
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Palette, MessageSquare, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { GeneralSection, DesignSection, FeaturesSection, MaintenanceSection } from './SiteSettingsSections';

interface SiteSettingsData {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: { facebook: string; instagram: string; twitter: string; youtube: string; linkedin: string; };
  theme: { primaryColor: string; secondaryColor: string; backgroundColor: string; textColor: string; };
  features: { enableBlog: boolean; enableShop: boolean; enableBooking: boolean; enableChat: boolean; enableNewsletter: boolean; };
  maintenance: { enabled: boolean; message: string; };
}

const defaultSettings: SiteSettingsData = {
  siteName: 'Fatras',
  siteDescription: 'Site officiel de Fatras - Découvrez notre univers musical',
  logo: '', favicon: '',
  contactEmail: 'contact@fatras.com',
  contactPhone: '+33 1 23 45 67 89',
  address: '123 Rue de la Musique, 75001 Paris',
  socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '' },
  theme: { primaryColor: '#1632f4', secondaryColor: '#ec5f65', backgroundColor: '#ffffff', textColor: '#1a1a1a' },
  features: { enableBlog: true, enableShop: true, enableBooking: true, enableChat: true, enableNewsletter: true },
  maintenance: { enabled: false, message: 'Site en maintenance. Nous reviendrons bientôt !' }
};

export const SiteSettings: React.FC = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'design' | 'features' | 'maintenance'>('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncToLocalStorage = React.useCallback((s: SiteSettingsData) => {
    localStorage.setItem('site_settings', JSON.stringify(s));
    const websiteSettings = { siteName: s.siteName, siteDescription: s.siteDescription, contactEmail: s.contactEmail, contactPhone: s.contactPhone, address: s.address, socialLinks: s.socialLinks };
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
    const websiteDesign = { siteName: s.siteName, logo: s.logo, primaryColor: s.theme.primaryColor, secondaryColor: s.theme.secondaryColor, headerBg: s.theme.backgroundColor, textColor: s.theme.textColor, linkColor: s.theme.primaryColor };
    localStorage.setItem('websiteDesign', JSON.stringify(websiteDesign));
    const websiteConfig = { siteName: s.siteName, siteDescription: s.siteDescription, logo: s.logo, favicon: s.favicon, primaryColor: s.theme.primaryColor, secondaryColor: s.theme.secondaryColor, headerBg: s.theme.backgroundColor, footerBg: '#1a1a1a', textColor: s.theme.textColor, linkColor: s.theme.primaryColor, contactEmail: s.contactEmail, contactPhone: s.contactPhone, address: s.address, socialLinks: s.socialLinks };
    localStorage.setItem('websiteConfig', JSON.stringify(websiteConfig));
    document.title = s.siteName;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', s.theme.primaryColor);
    root.style.setProperty('--secondary-color', s.theme.secondaryColor);
    root.style.setProperty('--background-color', s.theme.backgroundColor);
    root.style.setProperty('--text-color', s.theme.textColor);
    root.style.setProperty('--site-header-bg', s.theme.backgroundColor);
    root.style.setProperty('--site-footer-bg', '#1a1a1a');
    root.style.setProperty('--site-text-color', s.theme.textColor);
    root.style.setProperty('--site-link-color', s.theme.primaryColor);
    window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: websiteSettings }));
    window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: websiteDesign }));
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: websiteConfig }));
    window.dispatchEvent(new Event('websiteSettingsSaved'));
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const { data: designData } = await supabase.from('website_designs').select('*').eq('user_id', user.id).maybeSingle();
        const { data: appSettings } = await supabase.from('app_settings').select('setting_key, setting_value').eq('user_id', user.id)
          .in('setting_key', ['website_settings', 'website_social_links', 'website_features', 'website_maintenance']);
        const map: Record<string, any> = {};
        appSettings?.forEach(s => { try { map[s.setting_key] = JSON.parse(s.setting_value); } catch { map[s.setting_key] = s.setting_value; } });
        const loaded: SiteSettingsData = {
          siteName: designData?.site_name || defaultSettings.siteName,
          siteDescription: map.website_settings?.description || defaultSettings.siteDescription,
          logo: designData?.logo || defaultSettings.logo,
          favicon: map.website_settings?.favicon || defaultSettings.favicon,
          contactEmail: map.website_settings?.contactEmail || defaultSettings.contactEmail,
          contactPhone: map.website_settings?.contactPhone || defaultSettings.contactPhone,
          address: map.website_settings?.address || defaultSettings.address,
          socialLinks: map.website_social_links || defaultSettings.socialLinks,
          theme: { primaryColor: designData?.primary_color || defaultSettings.theme.primaryColor, secondaryColor: designData?.secondary_color || defaultSettings.theme.secondaryColor, backgroundColor: designData?.header_bg || defaultSettings.theme.backgroundColor, textColor: designData?.text_color || defaultSettings.theme.textColor },
          features: map.website_features || defaultSettings.features,
          maintenance: map.website_maintenance || defaultSettings.maintenance
        };
        setSettings(loaded);
        syncToLocalStorage(loaded);
      } catch (error: unknown) { logger.error('Erreur chargement paramètres:', error); }
      finally { setLoading(false); }
    };
    loadSettings();
  }, [user, syncToLocalStorage]);

  const saveSettings = async () => {
    if (!user) { toast.error('Vous devez être connecté pour sauvegarder'); return; }
    setSaving(true);
    try {
      const { error: designError } = await supabase.from('website_designs').upsert([{
        user_id: user.id, logo: settings.logo, site_name: settings.siteName, primary_color: settings.theme.primaryColor,
        secondary_color: settings.theme.secondaryColor, accent_color: settings.theme.secondaryColor,
        header_bg: settings.theme.backgroundColor, footer_bg: '#1a1a1a', text_color: settings.theme.textColor, link_color: settings.theme.primaryColor
      }], { onConflict: 'user_id' });
      if (designError) throw designError;

      for (const [key, value] of Object.entries({
        website_settings: { description: settings.siteDescription, favicon: settings.favicon, contactEmail: settings.contactEmail, contactPhone: settings.contactPhone, address: settings.address },
        website_social_links: settings.socialLinks,
        website_features: settings.features,
        website_maintenance: settings.maintenance
      })) {
        const { error } = await supabase.from('app_settings').upsert([{ user_id: user.id, setting_key: key, setting_value: JSON.stringify(value) }], { onConflict: 'user_id,setting_key' });
        if (error) logger.error('Erreur sauvegarde setting:', key, error);
      }
      syncToLocalStorage(settings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error: unknown) { logger.error('Erreur sauvegarde:', error); toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleFileUpload = (field: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { setSettings(prev => ({ ...prev, [field]: e.target?.result as string })); toast.success(`${field === 'logo' ? 'Logo' : 'Favicon'} chargé avec succès`); };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Chargement des paramètres...</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {([['general', Settings, 'Général'], ['design', Palette, 'Design'], ['features', MessageSquare, 'Fonctionnalités'], ['maintenance', Shield, 'Maintenance']] as const).map(([key, Icon, label]) => (
          <Button key={key} variant={activeSection === key ? 'default' : 'ghost'} size="sm" onClick={() => setActiveSection(key as any)}>
            <Icon className="h-4 w-4 mr-2" />{label}
          </Button>
        ))}
      </div>

      {activeSection === 'general' && <GeneralSection settings={settings} setSettings={setSettings} handleFileUpload={handleFileUpload} />}
      {activeSection === 'design' && <DesignSection settings={settings} setSettings={setSettings} />}
      {activeSection === 'features' && <FeaturesSection settings={settings} setSettings={setSettings} />}
      {activeSection === 'maintenance' && <MaintenanceSection settings={settings} setSettings={setSettings} />}

      <div className="pt-4">
        <Button onClick={saveSettings} className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde en cours...</> : <><Save className="h-4 w-4 mr-2" />Sauvegarder tous les paramètres</>}
        </Button>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Palette, 
  Mail, 
  Shield, 
  Save,
  Upload,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  features: {
    enableBlog: boolean;
    enableShop: boolean;
    enableBooking: boolean;
    enableChat: boolean;
    enableNewsletter: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: 'Fatras',
  siteDescription: 'Site officiel de Fatras - Découvrez notre univers musical',
  logo: '',
  favicon: '',
  contactEmail: 'contact@fatras.com',
  contactPhone: '+33 1 23 45 67 89',
  address: '123 Rue de la Musique, 75001 Paris',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: ''
  },
  theme: {
    primaryColor: '#1632f4',
    secondaryColor: '#ec5f65',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a'
  },
  features: {
    enableBlog: true,
    enableShop: true,
    enableBooking: true,
    enableChat: true,
    enableNewsletter: true
  },
  maintenance: {
    enabled: false,
    message: 'Site en maintenance. Nous reviendrons bientôt !'
  }
};

export const SiteSettings: React.FC = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'design' | 'features' | 'maintenance'>('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Synchroniser avec localStorage pour le front (défini avant useEffect)
  const syncToLocalStorage = React.useCallback((s: SiteSettings) => {
    localStorage.setItem('site_settings', JSON.stringify(s));
    
    const websiteSettings = {
      siteName: s.siteName,
      siteDescription: s.siteDescription,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      address: s.address,
      socialLinks: s.socialLinks
    };
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
    
    const websiteDesign = {
      siteName: s.siteName,
      logo: s.logo,
      primaryColor: s.theme.primaryColor,
      secondaryColor: s.theme.secondaryColor,
      headerBg: s.theme.backgroundColor,
      textColor: s.theme.textColor,
      linkColor: s.theme.primaryColor
    };
    localStorage.setItem('websiteDesign', JSON.stringify(websiteDesign));
    
    const websiteConfig = {
      siteName: s.siteName,
      siteDescription: s.siteDescription,
      logo: s.logo,
      favicon: s.favicon,
      primaryColor: s.theme.primaryColor,
      secondaryColor: s.theme.secondaryColor,
      headerBg: s.theme.backgroundColor,
      footerBg: '#1a1a1a',
      textColor: s.theme.textColor,
      linkColor: s.theme.primaryColor,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      address: s.address,
      socialLinks: s.socialLinks
    };
    localStorage.setItem('websiteConfig', JSON.stringify(websiteConfig));
    
    // Appliquer les changements CSS
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
    
    // Déclencher les événements
    window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: websiteSettings }));
    window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: websiteDesign }));
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: websiteConfig }));
    window.dispatchEvent(new Event('websiteSettingsSaved'));
  }, []);

  // Charger les paramètres depuis Supabase
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Charger depuis website_designs
        const { data: designData } = await supabase
          .from('website_designs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Charger depuis app_settings
        const { data: appSettings } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .eq('user_id', user.id)
          .in('setting_key', ['website_settings', 'website_social_links', 'website_features', 'website_maintenance']);

        const settingsMap: Record<string, any> = {};
        appSettings?.forEach(s => {
          try {
            settingsMap[s.setting_key] = JSON.parse(s.setting_value);
          } catch {
            settingsMap[s.setting_key] = s.setting_value;
          }
        });

        const loadedSettings: SiteSettings = {
          siteName: designData?.site_name || defaultSettings.siteName,
          siteDescription: settingsMap.website_settings?.description || defaultSettings.siteDescription,
          logo: designData?.logo || defaultSettings.logo,
          favicon: settingsMap.website_settings?.favicon || defaultSettings.favicon,
          contactEmail: settingsMap.website_settings?.contactEmail || defaultSettings.contactEmail,
          contactPhone: settingsMap.website_settings?.contactPhone || defaultSettings.contactPhone,
          address: settingsMap.website_settings?.address || defaultSettings.address,
          socialLinks: settingsMap.website_social_links || defaultSettings.socialLinks,
          theme: {
            primaryColor: designData?.primary_color || defaultSettings.theme.primaryColor,
            secondaryColor: designData?.secondary_color || defaultSettings.theme.secondaryColor,
            backgroundColor: designData?.header_bg || defaultSettings.theme.backgroundColor,
            textColor: designData?.text_color || defaultSettings.theme.textColor
          },
          features: settingsMap.website_features || defaultSettings.features,
          maintenance: settingsMap.website_maintenance || defaultSettings.maintenance
        };

        setSettings(loadedSettings);
        
        // Synchroniser avec localStorage pour le front
        syncToLocalStorage(loadedSettings);
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, syncToLocalStorage]);

  const saveSettings = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      return;
    }

    setSaving(true);
    try {
      // Sauvegarder dans website_designs (logo, nom, couleurs)
      const designData = {
        user_id: user.id,
        logo: settings.logo,
        site_name: settings.siteName,
        primary_color: settings.theme.primaryColor,
        secondary_color: settings.theme.secondaryColor,
        accent_color: settings.theme.secondaryColor,
        header_bg: settings.theme.backgroundColor,
        footer_bg: '#1a1a1a',
        text_color: settings.theme.textColor,
        link_color: settings.theme.primaryColor
      };

      const { error: designError } = await supabase
        .from('website_designs')
        .upsert([designData], { onConflict: 'user_id' });

      if (designError) throw designError;

      // Sauvegarder les autres paramètres dans app_settings
      const settingsToSave = [
        {
          user_id: user.id,
          setting_key: 'website_settings',
          setting_value: JSON.stringify({
            description: settings.siteDescription,
            favicon: settings.favicon,
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            address: settings.address
          })
        },
        {
          user_id: user.id,
          setting_key: 'website_social_links',
          setting_value: JSON.stringify(settings.socialLinks)
        },
        {
          user_id: user.id,
          setting_key: 'website_features',
          setting_value: JSON.stringify(settings.features)
        },
        {
          user_id: user.id,
          setting_key: 'website_maintenance',
          setting_value: JSON.stringify(settings.maintenance)
        }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('app_settings')
          .upsert([setting], { onConflict: 'user_id,setting_key' });
        
        if (error) {
          console.error('Erreur sauvegarde setting:', setting.setting_key, error);
        }
      }

      // Synchroniser avec localStorage pour le front
      syncToLocalStorage(settings);
      
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (field: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, [field]: result }));
        toast.success(`${field === 'logo' ? 'Logo' : 'Favicon'} chargé avec succès`);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeSection === 'general' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('general')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Général
        </Button>
        <Button
          variant={activeSection === 'design' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('design')}
        >
          <Palette className="h-4 w-4 mr-2" />
          Design
        </Button>
        <Button
          variant={activeSection === 'features' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('features')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Fonctionnalités
        </Button>
        <Button
          variant={activeSection === 'maintenance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('maintenance')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Maintenance
        </Button>
      </div>

      {activeSection === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du site</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email de contact</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description du site</label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <Input
                    value={settings.contactPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adresse</label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo et Favicon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Logo du site</label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logo', e)}
                    />
                    {settings.logo && (
                      <div className="mt-2">
                        <img src={settings.logo} alt="Logo" className="h-16 w-auto border rounded" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Favicon</label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('favicon', e)}
                    />
                    {settings.favicon && (
                      <div className="mt-2">
                        <img src={settings.favicon} alt="Favicon" className="h-8 w-8 border rounded" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.socialLinks).map(([platform, url]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium mb-2 capitalize">{platform}</label>
                    <Input
                      value={url}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                      }))}
                      placeholder={`URL ${platform}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'design' && (
        <Card>
          <CardHeader>
            <CardTitle>Personnalisation du thème</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Couleur principale</label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, primaryColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.theme.primaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, primaryColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Couleur secondaire</label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={settings.theme.secondaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, secondaryColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.theme.secondaryColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, secondaryColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Couleur de fond</label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={settings.theme.backgroundColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, backgroundColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.theme.backgroundColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, backgroundColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Couleur du texte</label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={settings.theme.textColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, textColor: e.target.value }
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.theme.textColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: { ...prev.theme, textColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités du site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div>
                  <label className="font-medium capitalize">
                    {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-sm text-gray-500">
                    {feature === 'enableBlog' && 'Système de blog intégré'}
                    {feature === 'enableShop' && 'Boutique en ligne'}
                    {feature === 'enableBooking' && 'Système de réservation'}
                    {feature === 'enableChat' && 'Widget de chat public'}
                    {feature === 'enableNewsletter' && 'Inscription newsletter'}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    features: { ...prev.features, [feature]: checked }
                  }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle>Mode maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.maintenance.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  maintenance: { ...prev.maintenance, enabled: checked }
                }))}
              />
              <label className="font-medium">Activer le mode maintenance</label>
            </div>
            
            {settings.maintenance.enabled && (
              <div>
                <label className="block text-sm font-medium mb-2">Message de maintenance</label>
                <Textarea
                  value={settings.maintenance.message}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maintenance: { ...prev.maintenance, message: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="pt-4">
        <Button onClick={saveSettings} className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder tous les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

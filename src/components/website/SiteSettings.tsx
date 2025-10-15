
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
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'design' | 'features' | 'maintenance'>('general');

  useEffect(() => {
    // Essayer de charger depuis site_settings d'abord
    const savedSettings = localStorage.getItem('site_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        return;
      } catch (error) {
        console.error('Erreur chargement paramètres site_settings:', error);
      }
    }
    
    // Sinon essayer de charger depuis websiteConfig
    const websiteConfig = localStorage.getItem('websiteConfig');
    if (websiteConfig) {
      try {
        const config = JSON.parse(websiteConfig);
        setSettings({
          ...defaultSettings,
          siteName: config.siteName || defaultSettings.siteName,
          siteDescription: config.siteDescription || defaultSettings.siteDescription,
          logo: config.logo || defaultSettings.logo,
          favicon: config.favicon || defaultSettings.favicon,
          contactEmail: config.contactEmail || defaultSettings.contactEmail,
          contactPhone: config.contactPhone || defaultSettings.contactPhone,
          address: config.address || defaultSettings.address,
          socialLinks: config.socialLinks || defaultSettings.socialLinks,
          theme: {
            primaryColor: config.primaryColor || defaultSettings.theme.primaryColor,
            secondaryColor: config.secondaryColor || defaultSettings.theme.secondaryColor,
            backgroundColor: config.headerBg || defaultSettings.theme.backgroundColor,
            textColor: config.textColor || defaultSettings.theme.textColor
          }
        });
      } catch (error) {
        console.error('Erreur chargement websiteConfig:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    // Sauvegarder dans site_settings (ancien système)
    localStorage.setItem('site_settings', JSON.stringify(settings));
    
    // Sauvegarder dans websiteSettings (clé largement utilisée par le front)
    const websiteSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      socialLinks: settings.socialLinks
    };
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
    
    // Sauvegarder un design minimal pour les composants qui lisent websiteDesign
    const websiteDesign = {
      siteName: settings.siteName,
      logo: settings.logo,
      primaryColor: settings.theme.primaryColor,
      secondaryColor: settings.theme.secondaryColor,
      headerBg: settings.theme.backgroundColor,
      textColor: settings.theme.textColor,
      linkColor: settings.theme.primaryColor
    };
    localStorage.setItem('websiteDesign', JSON.stringify(websiteDesign));
    
    // Sauvegarder dans websiteConfig (configuration unifiée utilisée par plusieurs composants)
    const websiteConfig = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      primaryColor: settings.theme.primaryColor,
      secondaryColor: settings.theme.secondaryColor,
      headerBg: settings.theme.backgroundColor,
      footerBg: '#1a1a1a',
      textColor: settings.theme.textColor,
      linkColor: settings.theme.primaryColor,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      socialLinks: settings.socialLinks,
      menuItems: []
    };
    localStorage.setItem('websiteConfig', JSON.stringify(websiteConfig));
    
    // Appliquer les changements immédiatement
    document.title = settings.siteName;
    
    // Mettre à jour les CSS custom properties pour le thème
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.theme.primaryColor);
    root.style.setProperty('--secondary-color', settings.theme.secondaryColor);
    root.style.setProperty('--background-color', settings.theme.backgroundColor);
    root.style.setProperty('--text-color', settings.theme.textColor);
    // Variables utilisées par le front
    root.style.setProperty('--site-header-bg', settings.theme.backgroundColor);
    root.style.setProperty('--site-footer-bg', '#1a1a1a');
    root.style.setProperty('--site-text-color', settings.theme.textColor);
    root.style.setProperty('--site-link-color', settings.theme.primaryColor);
    
    // Déclencher les événements de synchronisation
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated', { detail: settings }));
    window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: websiteSettings }));
    window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: websiteDesign }));
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: websiteConfig }));
    window.dispatchEvent(new Event('websiteSettingsSaved'));
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Paramètres sauvegardés avec succès');
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

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
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
        <Button onClick={saveSettings} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder tous les paramètres
        </Button>
      </div>
    </div>
  );
};

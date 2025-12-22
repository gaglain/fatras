import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  metaKeywords: string;
  favicon: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  enableCookieConsent: boolean;
  cookieConsentText: string;
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
  enableMaintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultSettings: WebsiteSettings = {
  siteName: 'Fatras',
  siteDescription: 'Chansons de rue et de Scène',
  metaKeywords: 'fatras, musique, spectacle, rue, scène',
  favicon: '/favicon.ico',
  googleAnalyticsId: '',
  facebookPixelId: '',
  enableCookieConsent: true,
  cookieConsentText: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
  contactEmail: 'contact@fatras.net',
  contactPhone: '',
  address: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: ''
  },
  enableMaintenanceMode: false,
  maintenanceMessage: 'Site en maintenance. Nous reviendrons bientôt !'
};

export const WebsiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // S'assurer que socialLinks existe toujours
        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(parsedSettings.socialLinks || {})
          }
        };
        setSettings(mergedSettings);
        console.log('⚙️ Loaded saved settings:', mergedSettings);
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleInputChange = (field: keyof WebsiteSettings, value: string | boolean) => {
    console.log(`🔧 Changing ${field} to:`, value);
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: keyof WebsiteSettings['socialLinks'], value: string) => {
    console.log(`🔗 Changing ${platform} to:`, value);
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, favicon: result }));
        
        // Mettre à jour le favicon immédiatement
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.type = 'image/x-icon';
        link.href = result;
        
        toast.success('Favicon chargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    console.log('💾 Saving settings:', settings);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    
    // Mettre à jour le titre de la page immédiatement
    if (settings.siteName) {
      document.title = settings.siteName;
      console.log('📝 Updated page title to:', settings.siteName);
    }
    
    // Mettre à jour les meta tags
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settings.siteDescription);
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.querySelector('meta[name="keywords"]');
      metaKeywords.setAttribute('name', 'keywords');
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', settings.metaKeywords);
    
    // Déclencher les événements de synchronisation IMMÉDIATEMENT
    console.log('🚀 Triggering settings sync events...');
    
    window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settings }));
    window.dispatchEvent(new CustomEvent('websiteSettingsSaved', { detail: settings }));
    
    // Forcer la synchronisation avec un petit délai
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settings }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteSettings',
        newValue: JSON.stringify(settings),
        storageArea: localStorage
      }));
    }, 100);
    
    // Autre tentative après 500ms
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteSettingsSaved', { detail: settings }));
    }, 500);
    
    toast.success('Paramètres sauvegardés avec succès ! La synchronisation peut prendre quelques secondes.');
    console.log('✅ Settings saved and events triggered');
  };

  // S'assurer que socialLinks existe avant de l'utiliser
  const socialLinks = settings.socialLinks || defaultSettings.socialLinks;

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Nom du site: "{settings.siteName}" | Email: "{settings.contactEmail}"
          </p>
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Nom de votre site"
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="siteDescription">Description du site</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              placeholder="Description de votre site pour le SEO"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="metaKeywords">Mots-clés SEO</Label>
            <Input
              id="metaKeywords"
              value={settings.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              placeholder="musique, artistes, événements, booking"
            />
          </div>
        </CardContent>
      </Card>

      {/* Favicon */}
      <Card>
        <CardHeader>
          <CardTitle>Icône du site (Favicon)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
              />
            </div>
            {settings.favicon && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={settings.favicon}
                  alt="Favicon"
                  className="h-8 w-8 object-contain border rounded"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <Badge variant="secondary" className="text-xs">Favicon chargé</Badge>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Cette icône apparaîtra dans l'onglet du navigateur. Format recommandé : PNG 32x32px ou ICO.
          </p>
        </CardContent>
      </Card>

      {/* Contact et Adresse */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Rue de la Musique, 75001 Paris"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(socialLinks).map(([platform, url]) => (
              <div key={platform}>
                <Label htmlFor={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Label>
                <Input
                  id={platform}
                  value={url}
                  onChange={(e) => handleSocialLinkChange(platform as keyof WebsiteSettings['socialLinks'], e.target.value)}
                  placeholder={`https://${platform}.com/votrepage`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics et Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics et Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                placeholder="GA-XXXXXXXXX-X"
              />
            </div>
            
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId}
                onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookies et Confidentialité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Cookies et Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableCookieConsent"
              checked={settings.enableCookieConsent}
              onCheckedChange={(checked) => handleInputChange('enableCookieConsent', checked)}
            />
            <Label htmlFor="enableCookieConsent">
              Activer le bandeau de consentement des cookies
            </Label>
          </div>
          
          {settings.enableCookieConsent && (
            <div>
              <Label htmlFor="cookieConsentText">Message du bandeau cookies</Label>
              <Textarea
                id="cookieConsentText"
                value={settings.cookieConsentText}
                onChange={(e) => handleInputChange('cookieConsentText', e.target.value)}
                placeholder="Message affiché dans le bandeau cookies"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Mode Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableMaintenanceMode"
              checked={settings.enableMaintenanceMode}
              onCheckedChange={(checked) => handleInputChange('enableMaintenanceMode', checked)}
            />
            <Label htmlFor="enableMaintenanceMode">
              Activer le mode maintenance
            </Label>
          </div>
          
          {settings.enableMaintenanceMode && (
            <div>
              <Label htmlFor="maintenanceMessage">Message de maintenance</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                placeholder="Message affiché aux visiteurs"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Globe, Palette, Settings, Phone, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const WebsiteConfigManager: React.FC = () => {
  const { config, updateConfig } = useWebsiteConfig();
  const [localConfig, setLocalConfig] = useState(config);

  // Sync avec le contexte global
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalConfig(prev => ({ ...prev, logo: result }));
        toast.success('Logo chargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalConfig(prev => ({ ...prev, favicon: result }));
        
        // Mettre à jour le favicon immédiatement
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = result;
        
        toast.success('Favicon chargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveConfig = () => {
    updateConfig(localConfig);
    
    // Déclencher l'événement de synchronisation
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: localConfig }));
    
    toast.success(`Configuration sauvegardée ! Site: "${localConfig.siteName}"`);
  };

  return (
    <div className="space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={localConfig.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="MusiConnect"
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description</Label>
              <Input
                id="siteDescription"
                value={localConfig.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="Votre plateforme musicale"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {localConfig.logo && (
                <div className="flex items-center space-x-2">
                  <img
                    src={localConfig.logo}
                    alt="Logo"
                    className="h-12 w-12 object-contain border rounded"
                  />
                  <Badge variant="secondary">Logo chargé</Badge>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="favicon">Favicon</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="favicon"
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
              />
              {localConfig.favicon && (
                <div className="flex items-center space-x-2">
                  <img
                    src={localConfig.favicon}
                    alt="Favicon"
                    className="h-8 w-8 object-contain border rounded"
                  />
                  <Badge variant="secondary">Favicon chargé</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={localConfig.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={localConfig.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Couleur secondaire</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={localConfig.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={localConfig.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textColor">Couleur du texte</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={localConfig.textColor}
                  onChange={(e) => handleInputChange('textColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={localConfig.textColor}
                  onChange={(e) => handleInputChange('textColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="linkColor">Couleur des liens</Label>
              <div className="flex gap-2">
                <Input
                  id="linkColor"
                  type="color"
                  value={localConfig.linkColor}
                  onChange={(e) => handleInputChange('linkColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={localConfig.linkColor}
                  onChange={(e) => handleInputChange('linkColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={localConfig.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                value={localConfig.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={localConfig.address}
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
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Réseaux sociaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localConfig.socialLinks).map(([platform, url]) => (
              <div key={platform}>
                <Label htmlFor={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Label>
                <Input
                  id={platform}
                  value={url}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  placeholder={`https://${platform}.com/votrepage`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres avancés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Paramètres avancés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={localConfig.googleAnalyticsId}
                onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                placeholder="GA-XXXXXXXXX-X"
              />
            </div>
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={localConfig.facebookPixelId}
                onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableCookieConsent"
              checked={localConfig.enableCookieConsent}
              onCheckedChange={(checked) => handleInputChange('enableCookieConsent', checked)}
            />
            <Label htmlFor="enableCookieConsent">
              Activer le bandeau de consentement des cookies
            </Label>
          </div>
          
          {localConfig.enableCookieConsent && (
            <div>
              <Label htmlFor="cookieConsentText">Message du bandeau cookies</Label>
              <Textarea
                id="cookieConsentText"
                value={localConfig.cookieConsentText}
                onChange={(e) => handleInputChange('cookieConsentText', e.target.value)}
                placeholder="Message affiché dans le bandeau cookies"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder la configuration
        </Button>
      </div>
    </div>
  );
};

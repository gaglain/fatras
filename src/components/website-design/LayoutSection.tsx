import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Eye, RefreshCw } from 'lucide-react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { toast } from 'sonner';
import { ResponsivePreview, getViewportWidth } from '@/components/page-builder/ResponsivePreview';
import type { ViewportMode } from '@/components/page-builder/types';

export const LayoutSection: React.FC = () => {
  const { config, updateConfig } = useWebsiteConfig();

  const [viewport, setViewport] = React.useState<ViewportMode>('desktop');
  const [previewNonce, setPreviewNonce] = React.useState(0);

  const [localConfig, setLocalConfig] = React.useState({
    siteName: config.siteName,
    headerBg: config.headerBg,
    footerBg: config.footerBg,
    textColor: config.textColor,
    linkColor: config.linkColor,
    logo: config.logo,
    contactEmail: config.contactEmail,
    contactPhone: config.contactPhone,
    address: config.address,
    siteDescription: config.siteDescription,
    socialLinks: config.socialLinks
  });

  React.useEffect(() => {
    setLocalConfig({
      siteName: config.siteName,
      headerBg: config.headerBg,
      footerBg: config.footerBg,
      textColor: config.textColor,
      linkColor: config.linkColor,
      logo: config.logo,
      contactEmail: config.contactEmail,
      contactPhone: config.contactPhone,
      address: config.address,
      siteDescription: config.siteDescription,
      socialLinks: config.socialLinks
    });
  }, [config]);

  const handleSave = () => {
    console.log('💾 Saving layout config:', localConfig.siteName);
    updateConfig(localConfig);
    setPreviewNonce((n) => n + 1);
    toast.success(`Configuration sauvegardée ! Site: "${localConfig.siteName}"`);
  };

  const handlePreview = () => {
    console.log('👁️ Preview requested');

    // Sauvegarder d'abord
    updateConfig(localConfig);
    setPreviewNonce((n) => n + 1);

    // Ouvrir la preview après un court délai
    setTimeout(() => {
      window.open('/front', '_blank');
    }, 300);
  };

  const handleInputChange = (field: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalConfig(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const frameWidth = getViewportWidth(viewport);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Header et Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations générales</h3>

            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={localConfig.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="ex: Mon Site Web"
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">Description du site</Label>
              <Input
                id="siteDescription"
                value={localConfig.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="ex: Votre site web professionnel"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo du site</Label>
              <div className="space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {localConfig.logo && (
                  <div className="mt-2">
                    <img src={localConfig.logo} alt="Logo" className="h-12 w-auto border rounded" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Couleurs et style</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headerBg">Couleur de fond du header</Label>
                <Input
                  id="headerBg"
                  value={localConfig.headerBg}
                  onChange={(e) => handleInputChange('headerBg', e.target.value)}
                  placeholder="ex: #1a1f2e ou linear-gradient(...)"
                />
              </div>

              <div>
                <Label htmlFor="footerBg">Couleur de fond du footer</Label>
                <Input
                  id="footerBg"
                  value={localConfig.footerBg}
                  onChange={(e) => handleInputChange('footerBg', e.target.value)}
                  placeholder="ex: #1a1f2e ou linear-gradient(...)"
                />
              </div>

              <div>
                <Label htmlFor="textColor">Couleur du texte</Label>
                <Input
                  id="textColor"
                  value={localConfig.textColor}
                  onChange={(e) => handleInputChange('textColor', e.target.value)}
                  placeholder="ex: #ffffff"
                />
              </div>

              <div>
                <Label htmlFor="linkColor">Couleur des liens</Label>
                <Input
                  id="linkColor"
                  value={localConfig.linkColor}
                  onChange={(e) => handleInputChange('linkColor', e.target.value)}
                  placeholder="ex: #60a5fa"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de contact (Footer)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Email de contact</Label>
                <Input
                  id="contactEmail"
                  value={localConfig.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="ex: contact@monsite.com"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Téléphone</Label>
                <Input
                  id="contactPhone"
                  value={localConfig.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="ex: +33 1 23 45 67 89"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={localConfig.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="ex: 123 Rue Example, 75001 Paris"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Réseaux sociaux</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={localConfig.socialLinks.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/monsite"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={localConfig.socialLinks.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/monsite"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={localConfig.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/monsite"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={localConfig.socialLinks.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/monsite"
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={localConfig.socialLinks.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/monsite"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Aperçu (rendu front)</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ResponsivePreview mode={viewport} onModeChange={setViewport} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewNonce((n) => n + 1)}
              title="Recharger l’aperçu"
              className="h-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="rounded-lg border bg-muted/30 p-2 sm:p-3">
            <div
              className="mx-auto overflow-hidden rounded-md border bg-background"
              style={{ width: frameWidth }}
            >
              <iframe
                key={`${viewport}-${previewNonce}`}
                title="Aperçu du site (front)"
                src={`/front?preview=1&v=${previewNonce}`}
                className="w-full h-[720px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

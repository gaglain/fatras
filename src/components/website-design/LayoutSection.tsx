
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Eye } from 'lucide-react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { toast } from 'sonner';

export const LayoutSection: React.FC = () => {
  const { config, updateConfig } = useWebsiteConfig();

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
    console.log('💾 Sauvegarde de la configuration:', localConfig);
    updateConfig(localConfig);
    
    // Force la synchronisation immédiate
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigForceReload', {
        detail: localConfig
      }));
    }, 100);
    
    toast.success('Configuration du header et footer sauvegardée');
  };

  const handlePreview = () => {
    // Sauvegarder d'abord
    updateConfig(localConfig);
    
    // Force la synchronisation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigForceReload', {
        detail: localConfig
      }));
    }, 100);
    
    // Ouvrir la prévisualisation
    setTimeout(() => {
      window.open('/front', '_blank');
    }, 500);
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

  const handleInputChange = (field: string, value: any) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
  };

  const handleSocialChange = (platform: string, value: string) => {
    const newSocialLinks = { ...localConfig.socialLinks, [platform]: value };
    const newConfig = { ...localConfig, socialLinks: newSocialLinks };
    setLocalConfig(newConfig);
  };

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

          {/* Couleurs */}
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

          {/* Informations de contact pour le footer */}
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

          {/* Réseaux sociaux */}
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

      {/* Aperçu en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du header</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-4 rounded border"
            style={{
              background: localConfig.headerBg,
              color: localConfig.textColor
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {localConfig.logo && (
                  <img src={localConfig.logo} alt="Logo" className="h-8 w-auto" />
                )}
                <span className="text-xl font-bold">{localConfig.siteName}</span>
              </div>
              <nav className="flex space-x-4">
                <a href="#" style={{ color: localConfig.linkColor }}>Accueil</a>
                <a href="#" style={{ color: localConfig.linkColor }}>Artistes</a>
                <a href="#" style={{ color: localConfig.linkColor }}>Événements</a>
                <a href="#" style={{ color: localConfig.linkColor }}>Contact</a>
              </nav>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu du footer */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu du footer</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-4 rounded border"
            style={{
              background: localConfig.footerBg,
              color: localConfig.textColor
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-lg">Contact</h3>
                <div className="space-y-2 text-sm">
                  <p>{localConfig.contactEmail}</p>
                  <p>{localConfig.contactPhone}</p>
                  <p>{localConfig.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg">Suivez-nous</h3>
                <div className="flex space-x-4">
                  {localConfig.socialLinks.facebook && (
                    <a href={localConfig.socialLinks.facebook} style={{ color: localConfig.linkColor }}>Facebook</a>
                  )}
                  {localConfig.socialLinks.instagram && (
                    <a href={localConfig.socialLinks.instagram} style={{ color: localConfig.linkColor }}>Instagram</a>
                  )}
                  {localConfig.socialLinks.twitter && (
                    <a href={localConfig.socialLinks.twitter} style={{ color: localConfig.linkColor }}>Twitter</a>
                  )}
                  {localConfig.socialLinks.linkedin && (
                    <a href={localConfig.socialLinks.linkedin} style={{ color: localConfig.linkColor }}>LinkedIn</a>
                  )}
                  {localConfig.socialLinks.youtube && (
                    <a href={localConfig.socialLinks.youtube} style={{ color: localConfig.linkColor }}>YouTube</a>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg">Informations légales</h3>
                <div className="space-y-2 text-sm">
                  <a href="/mentions-legales" style={{ color: localConfig.linkColor }}>Mentions légales</a>
                  <a href="/cgv" style={{ color: localConfig.linkColor }}>CGV</a>
                  <a href="/politique-confidentialite" style={{ color: localConfig.linkColor }}>Politique de confidentialité</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
              <p>© 2024 {localConfig.siteName}. Tous droits réservés.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

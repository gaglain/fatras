
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
    logo: config.logo
  });

  React.useEffect(() => {
    setLocalConfig({
      siteName: config.siteName,
      headerBg: config.headerBg,
      footerBg: config.footerBg,
      textColor: config.textColor,
      linkColor: config.linkColor,
      logo: config.logo
    });
  }, [config]);

  const handleSave = () => {
    updateConfig(localConfig);
    toast.success('Configuration du header et footer sauvegardée');
  };

  const handlePreview = () => {
    // Appliquer temporairement les changements pour prévisualisation
    updateConfig(localConfig);
    window.open('/front', '_blank');
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
                onChange={(e) => setLocalConfig(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="ex: Fatras"
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
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, headerBg: e.target.value }))}
                  placeholder="ex: #1a1f2e ou linear-gradient(...)"
                />
              </div>

              <div>
                <Label htmlFor="footerBg">Couleur de fond du footer</Label>
                <Input
                  id="footerBg"
                  value={localConfig.footerBg}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, footerBg: e.target.value }))}
                  placeholder="ex: #1a1f2e ou linear-gradient(...)"
                />
              </div>

              <div>
                <Label htmlFor="textColor">Couleur du texte</Label>
                <Input
                  id="textColor"
                  value={localConfig.textColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, textColor: e.target.value }))}
                  placeholder="ex: #ffffff"
                />
              </div>

              <div>
                <Label htmlFor="linkColor">Couleur des liens</Label>
                <Input
                  id="linkColor"
                  value={localConfig.linkColor}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, linkColor: e.target.value }))}
                  placeholder="ex: #60a5fa"
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
    </div>
  );
};

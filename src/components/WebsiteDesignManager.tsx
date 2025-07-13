import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Upload, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  textColor: string;
  linkColor: string;
}

const defaultDesign: SiteDesign = {
  logo: '/logo.svg',
  siteName: 'MusiConnect',
  primaryColor: '#1632f4',
  secondaryColor: '#ec5f65',
  accentColor: '#f19e9c',
  headerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  footerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  textColor: '#ffffff',
  linkColor: '#60a5fa'
};

export const WebsiteDesignManager: React.FC = () => {
  const [design, setDesign] = useState<SiteDesign>(defaultDesign);

  useEffect(() => {
    // Charger la configuration sauvegardée
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        setDesign(prev => ({ ...prev, ...parsed }));
        console.log('🎨 Loaded saved design:', parsed);
      } catch (error) {
        console.error('❌ Error loading design:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof SiteDesign, value: string) => {
    console.log(`🔧 Changing ${field} to:`, value);
    setDesign(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('📸 Logo uploaded');
        setDesign(prev => ({ ...prev, logo: result }));
        toast.success('Logo chargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAllSyncEvents = (designData: SiteDesign) => {
    console.log('🚀 Triggering ALL sync events for design with MAXIMUM force');
    
    // Sauvegarder immédiatement dans localStorage
    localStorage.setItem('websiteDesign', JSON.stringify(designData));
    
    // Déclencher TOUS les événements possibles
    const events = [
      'websiteDesignUpdated',
      'websiteDesignSaved',
      'websiteSettingsUpdated',
      'websiteFullSync'
    ];
    
    events.forEach(eventName => {
      // Événement simple
      window.dispatchEvent(new CustomEvent(eventName, { detail: designData }));
      
      // Événement avec bubble
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: designData, 
        bubbles: true, 
        cancelable: true 
      }));
      
      console.log(`✅ Event ${eventName} dispatched with force`);
    });
    
    // Événement storage multiple fois pour s'assurer
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'websiteDesign',
          newValue: JSON.stringify(designData),
          oldValue: null,
          storageArea: localStorage,
          url: window.location.href
        }));
      }, i * 100);
    }
    
    console.log('✅ All storage events dispatched');
    
    // Forcer un reload du DOM après les événements
    setTimeout(() => {
      const event = new CustomEvent('forceReload', { detail: designData });
      window.dispatchEvent(event);
    }, 200);
  };

  const saveDesign = () => {
    console.log('💾 Saving design with MAXIMUM force:', design);
    
    try {
      // Déclencher IMMÉDIATEMENT tous les événements de synchronisation
      triggerAllSyncEvents(design);
      
      toast.success('Design sauvegardé avec succès !');
      console.log('✅ Design saved and ALL events triggered with force');
      
      // Forcer plusieurs fois avec des délais pour maximiser les chances
      setTimeout(() => {
        console.log('🔄 Force triggering events again after 300ms delay');
        triggerAllSyncEvents(design);
      }, 300);
      
      setTimeout(() => {
        console.log('🔄 Force triggering events again after 1000ms delay');
        triggerAllSyncEvents(design);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 Resetting design to default');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    
    // Déclencher les événements avec le design par défaut
    triggerAllSyncEvents(defaultDesign);
    
    toast.success('Design réinitialisé');
  };

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Nom actuel: "{design.siteName}" | Logo: {design.logo ? 'Défini' : 'Non défini'}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            💡 Les changements sont maintenant synchronisés en temps réel avec le frontend
          </p>
        </CardContent>
      </Card>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo et Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Logo et Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={design.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Nom de votre site"
              />
            </div>
            
            <div>
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                {design.logo && (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={design.logo}
                      alt="Logo"
                      className="h-12 w-12 object-contain border rounded"
                      onError={(e) => { 
                        console.error('❌ Logo loading error');
                        (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                      }}
                    />
                    <Badge variant="secondary" className="text-xs">Logo chargé</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Couleurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={design.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={design.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Couleur du texte</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={design.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={design.textColor}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkColor">Couleur des liens</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="linkColor"
                    type="color"
                    value={design.linkColor}
                    onChange={(e) => handleInputChange('linkColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={design.linkColor}
                    onChange={(e) => handleInputChange('linkColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Header et Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headerBg">Couleur de fond du header</Label>
              <Input
                id="headerBg"
                value={design.headerBg}
                onChange={(e) => handleInputChange('headerBg', e.target.value)}
                placeholder="ex: #1a1f2e ou linear-gradient(...)"
              />
            </div>

            <div>
              <Label htmlFor="footerBg">Couleur de fond du footer</Label>
              <Input
                id="footerBg"
                value={design.footerBg}
                onChange={(e) => handleInputChange('footerBg', e.target.value)}
                placeholder="ex: #1a1f2e ou linear-gradient(...)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveDesign} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder le design
        </Button>
        <Button variant="outline" onClick={resetDesign}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

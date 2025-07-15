
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { LogoSection } from './website-design/LogoSection';
import { ColorSection } from './website-design/ColorSection';
import { LayoutSection } from './website-design/LayoutSection';

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
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        setDesign(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading design:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof SiteDesign, value: string) => {
    setDesign(prev => ({ ...prev, [field]: value }));
  };

  const saveDesign = () => {
    try {
      console.log('💾 SAVING DESIGN:', design);
      
      // Sauvegarder websiteDesign
      const designString = JSON.stringify(design);
      localStorage.setItem('websiteDesign', designString);
      console.log('✅ websiteDesign saved:', designString);
      
      // Sauvegarder websiteSettings pour compatibilité
      const settingsData = {
        siteName: design.siteName,
        logo: design.logo
      };
      const settingsString = JSON.stringify(settingsData);
      localStorage.setItem('websiteSettings', settingsString);
      console.log('✅ websiteSettings saved:', settingsString);
      
      // Mettre à jour le titre immédiatement
      document.title = design.siteName;
      
      // Déclencher tous les événements
      const events = ['websiteDesignUpdated', 'websiteDesignSaved', 'websiteSettingsUpdated', 'siteConfigChanged'];
      events.forEach(eventName => {
        const event = new CustomEvent(eventName, { detail: design });
        window.dispatchEvent(event);
        console.log(`✅ Event ${eventName} dispatched`);
      });
      
      // Déclencher l'événement storage manuellement
      const storageEvent = new StorageEvent('storage', {
        key: 'websiteDesign',
        newValue: designString,
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      });
      window.dispatchEvent(storageEvent);
      
      toast.success(`✅ Design sauvegardé ! Site: "${design.siteName}"`);
      
    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    localStorage.removeItem('websiteSettings');
    
    const event = new CustomEvent('websiteDesignUpdated', { detail: defaultDesign });
    window.dispatchEvent(event);
    
    toast.success('Design réinitialisé');
  };

  return (
    <div className="space-y-6">
      {/* Debug info détaillé */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4">
          <p className="text-sm text-red-800">
            <strong>🎯 ÉTAT ACTUEL:</strong> Nom: "{design.siteName}"
          </p>
          <p className="text-sm text-red-600 mt-1">
            💾 localStorage websiteDesign: {localStorage.getItem('websiteDesign') ? '✅ EXISTS' : '❌ MISSING'}
          </p>
          <p className="text-sm text-red-600">
            💾 localStorage websiteSettings: {localStorage.getItem('websiteSettings') ? '✅ EXISTS' : '❌ MISSING'}
          </p>
          <p className="text-sm text-red-600">
            📄 Document title: "{document.title}"
          </p>
          <div className="mt-2 p-2 bg-red-100 rounded text-xs overflow-hidden">
            <strong>Raw websiteDesign:</strong> {localStorage.getItem('websiteDesign')?.substring(0, 100) || 'NULL'}...
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogoSection
          siteName={design.siteName}
          logo={design.logo}
          onSiteNameChange={(value) => handleInputChange('siteName', value)}
          onLogoChange={(value) => handleInputChange('logo', value)}
        />
        
        <ColorSection
          design={design}
          onInputChange={handleInputChange}
        />
      </div>

      <LayoutSection
        headerBg={design.headerBg}
        footerBg={design.footerBg}
        onHeaderBgChange={(value) => handleInputChange('headerBg', value)}
        onFooterBgChange={(value) => handleInputChange('footerBg', value)}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveDesign} className="bg-green-600 hover:bg-green-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          💾 SAUVEGARDER MAINTENANT
        </Button>
        <Button variant="outline" onClick={resetDesign}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
      
      {/* Test instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-800">🧪 Test:</h3>
          <p className="text-sm text-blue-600 mt-1">
            1. Changez le nom ci-dessus en "Fatras"<br/>
            2. Cliquez sur "SAUVEGARDER MAINTENANT"<br/>
            3. Vérifiez que les deux localStorage passent à "EXISTS"<br/>
            4. Allez sur /front - le nom devrait changer
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

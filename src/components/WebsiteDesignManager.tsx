
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
    console.log('🔄 WebsiteDesignManager - Loading saved design...');
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        console.log('✅ WebsiteDesignManager - Loaded design:', parsed);
        setDesign(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('❌ WebsiteDesignManager - Error loading design:', error);
      }
    } else {
      console.log('⚠️ WebsiteDesignManager - No saved design found');
    }
  }, []);

  const handleInputChange = (field: keyof SiteDesign, value: string) => {
    console.log(`📝 WebsiteDesignManager - Changing ${field} to:`, value);
    setDesign(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const saveDesign = () => {
    try {
      console.log('💾 WebsiteDesignManager - SAVING DESIGN:', design);
      
      // 1. Sauvegarder websiteDesign (priorité absolue)
      const designString = JSON.stringify(design);
      localStorage.setItem('websiteDesign', designString);
      console.log('✅ websiteDesign SAVED:', designString);
      
      // 2. Sauvegarder websiteSettings pour compatibilité
      const settingsData = {
        siteName: design.siteName,
        logo: design.logo
      };
      const settingsString = JSON.stringify(settingsData);
      localStorage.setItem('websiteSettings', settingsString);
      console.log('✅ websiteSettings SAVED:', settingsString);
      
      // 3. Mettre à jour le titre immédiatement
      document.title = design.siteName;
      console.log('✅ Document title updated to:', design.siteName);
      
      // 4. Vérification immédiate
      const check1 = localStorage.getItem('websiteDesign');
      const check2 = localStorage.getItem('websiteSettings');
      console.log('🔍 VERIFICATION - websiteDesign:', check1 ? 'EXISTS' : 'MISSING');
      console.log('🔍 VERIFICATION - websiteSettings:', check2 ? 'EXISTS' : 'MISSING');
      
      // 5. Déclencher les événements de synchronisation
      window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: design }));
      window.dispatchEvent(new CustomEvent('websiteDesignSaved', { detail: design }));
      window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settingsData }));
      window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: design }));
      
      // 6. Déclencher l'événement storage
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteDesign',
        newValue: designString,
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      }));
      
      console.log('✅ All events dispatched');
      
      toast.success(`✅ Design sauvegardé ! Site: "${design.siteName}"`);
      
    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 WebsiteDesignManager - Resetting design...');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    localStorage.removeItem('websiteSettings');
    
    window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: defaultDesign }));
    window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: defaultDesign }));
    
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
          💾 FORCER LA SAUVEGARDE
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
            2. Cliquez sur "FORCER LA SAUVEGARDE"<br/>
            3. Vérifiez que les deux localStorage passent à "EXISTS"<br/>
            4. Allez sur /front - le nom devrait changer immédiatement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

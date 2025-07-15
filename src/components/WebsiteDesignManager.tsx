
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
  const [isSaving, setIsSaving] = useState(false);

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

  const saveDesign = async () => {
    setIsSaving(true);
    console.log('💾 WebsiteDesignManager - SAVING DESIGN:', design);
    
    try {
      // 1. Créer les objets à sauvegarder
      const designData = { ...design };
      const settingsData = {
        siteName: design.siteName,
        logo: design.logo
      };

      // 2. Supprimer les anciennes données pour éviter les conflits
      localStorage.removeItem('websiteDesign');
      localStorage.removeItem('websiteSettings');
      
      // 3. Attendre un tick pour s'assurer que la suppression est effective
      await new Promise(resolve => setTimeout(resolve, 10));

      // 4. Sauvegarder les nouvelles données
      localStorage.setItem('websiteDesign', JSON.stringify(designData));
      localStorage.setItem('websiteSettings', JSON.stringify(settingsData));
      
      // 5. Vérification immédiate
      const checkDesign = localStorage.getItem('websiteDesign');
      const checkSettings = localStorage.getItem('websiteSettings');
      
      console.log('🔍 Immediate verification:');
      console.log('  - websiteDesign:', checkDesign ? 'EXISTS' : 'MISSING');
      console.log('  - websiteSettings:', checkSettings ? 'EXISTS' : 'MISSING');

      if (!checkDesign || !checkSettings) {
        throw new Error('Failed to save to localStorage');
      }

      // 6. Mettre à jour le titre
      document.title = design.siteName;
      console.log('✅ Document title updated to:', design.siteName);

      // 7. Déclencher tous les événements de synchronisation
      const events = [
        'websiteDesignUpdated',
        'websiteDesignSaved', 
        'websiteSettingsUpdated',
        'siteConfigChanged'
      ];
      
      events.forEach(eventName => {
        const event = new CustomEvent(eventName, { 
          detail: { siteName: design.siteName, design: designData, settings: settingsData }
        });
        window.dispatchEvent(event);
        console.log(`📡 Event dispatched: ${eventName}`);
      });

      // 8. Déclencher l'événement storage manuellement
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteDesign',
        newValue: JSON.stringify(designData),
        storageArea: localStorage
      }));

      // 9. Forcer le re-render de cette page
      setDesign({ ...design });

      toast.success(`✅ Design sauvegardé ! Site: "${design.siteName}"`);

    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const resetDesign = () => {
    console.log('🔄 WebsiteDesignManager - Resetting design...');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    localStorage.removeItem('websiteSettings');
    document.title = defaultDesign.siteName;
    toast.success('Design réinitialisé');
  };

  // Vérification en temps réel du localStorage
  const designExists = localStorage.getItem('websiteDesign') !== null;
  const settingsExists = localStorage.getItem('websiteSettings') !== null;

  return (
    <div className="space-y-6">
      {/* Debug info détaillé */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4">
          <p className="text-sm text-red-800">
            <strong>🎯 ÉTAT ACTUEL:</strong> Nom: "{design.siteName}"
          </p>
          <p className="text-sm text-red-600 mt-1">
            💾 localStorage websiteDesign: {designExists ? '✅ EXISTS' : '❌ MISSING'}
          </p>
          <p className="text-sm text-red-600">
            💾 localStorage websiteSettings: {settingsExists ? '✅ EXISTS' : '❌ MISSING'}
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
        <Button 
          onClick={saveDesign} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '💾 SAUVEGARDE...' : '💾 SAUVEGARDER (SANS RELOAD)'}
        </Button>
        <Button variant="outline" onClick={resetDesign} disabled={isSaving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
      
      {/* Test instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-800">🧪 TEST FINAL:</h3>
          <p className="text-sm text-blue-600 mt-1">
            1. Changez le nom ci-dessus en "Fatras"<br/>
            2. Cliquez sur "SAUVEGARDER (SANS RELOAD)"<br/>
            3. Vérifiez que les localStorage passent à "EXISTS"<br/>
            4. Allez sur /front - le nom devrait changer immédiatement<br/>
            5. Si ça ne marche toujours pas, il y a un problème de navigateur
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

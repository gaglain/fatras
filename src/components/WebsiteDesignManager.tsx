
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
    console.log('🎨 WebsiteDesignManager - Loading savedDesign:', savedDesign);
    
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        console.log('🎨 WebsiteDesignManager - Parsed design:', parsed);
        setDesign(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('❌ WebsiteDesignManager - Error loading design:', error);
      }
    } else {
      console.log('⚠️ WebsiteDesignManager - No saved design found');
    }
  }, []);

  const handleInputChange = (field: keyof SiteDesign, value: string) => {
    console.log(`🔧 WebsiteDesignManager - Changing ${field} to:`, value);
    setDesign(prev => {
      const newDesign = { ...prev, [field]: value };
      console.log('🔧 WebsiteDesignManager - New design state:', newDesign);
      return newDesign;
    });
  };

  const saveDesign = () => {
    console.log('💾 WebsiteDesignManager - SAVING DESIGN:', design);
    
    try {
      // ÉTAPE 1: Sauvegarder dans localStorage
      const designString = JSON.stringify(design);
      localStorage.setItem('websiteDesign', designString);
      console.log('✅ WebsiteDesignManager - Saved to localStorage:', designString);
      
      // ÉTAPE 2: Vérifier immédiatement que c'est bien sauvegardé
      const verification = localStorage.getItem('websiteDesign');
      console.log('🔍 WebsiteDesignManager - Verification read:', verification);
      
      if (!verification) {
        throw new Error('Failed to save to localStorage');
      }
      
      // ÉTAPE 3: Mettre à jour le titre immédiatement
      document.title = design.siteName;
      console.log('📝 WebsiteDesignManager - Updated document title to:', design.siteName);
      
      // ÉTAPE 4: Déclencher TOUS les événements
      const events = [
        'websiteDesignUpdated',
        'websiteDesignSaved', 
        'websiteSettingsUpdated',
        'siteConfigChanged'
      ];
      
      events.forEach(eventName => {
        const event = new CustomEvent(eventName, { detail: design });
        window.dispatchEvent(event);
        console.log(`✅ WebsiteDesignManager - Event ${eventName} dispatched`);
      });
      
      // ÉTAPE 5: Forcer l'événement storage
      const storageEvent = new StorageEvent('storage', {
        key: 'websiteDesign',
        newValue: designString,
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      });
      window.dispatchEvent(storageEvent);
      console.log('✅ WebsiteDesignManager - Storage event dispatched');
      
      // ÉTAPE 6: Aussi sauvegarder dans websiteSettings pour compatibilité
      const websiteSettings = {
        siteName: design.siteName,
        logo: design.logo
      };
      localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
      console.log('✅ WebsiteDesignManager - Also saved websiteSettings for compatibility');
      
      toast.success(`✅ DESIGN SAUVEGARDÉ ! Site: "${design.siteName}"`);
      console.log('✅ WebsiteDesignManager - Design saved successfully');
      
    } catch (error) {
      console.error('❌ WebsiteDesignManager - Error saving design:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 WebsiteDesignManager - Resetting design to default');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    localStorage.removeItem('websiteSettings');
    
    // Déclencher les événements de reset
    const event = new CustomEvent('websiteDesignUpdated', { detail: defaultDesign });
    window.dispatchEvent(event);
    
    toast.success('Design réinitialisé');
  };

  return (
    <div className="space-y-6">
      {/* Debug info ULTRA détaillé */}
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
          <div className="mt-2 p-2 bg-red-100 rounded text-xs">
            <strong>Raw websiteDesign:</strong> {localStorage.getItem('websiteDesign') || 'NULL'}
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
      
      {/* Test rapide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-blue-800">🧪 Test rapide:</h3>
          <p className="text-sm text-blue-600 mt-1">
            1. Changez le nom ci-dessus en "Fatras"<br/>
            2. Cliquez sur "SAUVEGARDER MAINTENANT"<br/>
            3. Allez immédiatement sur /front<br/>
            4. Le nom devrait apparaître partout
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

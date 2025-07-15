
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
        console.log('🎨 WebsiteDesignManager - Design loaded:', parsed.siteName);
      } catch (error) {
        console.error('❌ WebsiteDesignManager - Error loading design:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof SiteDesign, value: string) => {
    console.log(`🔧 WebsiteDesignManager - Changing ${field} to:`, value);
    setDesign(prev => ({ ...prev, [field]: value }));
  };

  const triggerSyncEvents = (designData: SiteDesign) => {
    console.log('🚀 WebsiteDesignManager - MASSIVE SYNC OPERATION for:', designData.siteName);
    
    // Sauvegarder d'abord
    localStorage.setItem('websiteDesign', JSON.stringify(designData));
    console.log('💾 WebsiteDesignManager - Saved to localStorage');
    
    // Forcer la mise à jour du titre immédiatement
    document.title = designData.siteName;
    console.log('📝 WebsiteDesignManager - Updated document title to:', designData.siteName);
    
    // Déclencher TOUS les événements possibles
    const events = [
      'websiteDesignUpdated',
      'websiteDesignSaved',
      'websiteSettingsUpdated',
      'siteConfigChanged'
    ];
    
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { detail: designData });
      window.dispatchEvent(event);
      console.log(`✅ WebsiteDesignManager - Event ${eventName} dispatched`);
    });
    
    // Forcer l'événement storage manuellement plusieurs fois
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'websiteDesign',
          newValue: JSON.stringify(designData),
          oldValue: null,
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
        console.log(`✅ WebsiteDesignManager - Storage event dispatched #${i + 1}`);
      }, i * 100);
    }
    
    // Forcer un reload de la page front si elle est ouverte dans un autre onglet
    if (window.opener || window.parent !== window) {
      try {
        window.postMessage({ type: 'SITE_CONFIG_UPDATE', data: designData }, '*');
      } catch (e) {
        console.log('Could not post message to parent window');
      }
    }
    
    console.log('✅ WebsiteDesignManager - ALL SYNC EVENTS TRIGGERED');
  };

  const saveDesign = () => {
    console.log('💾 WebsiteDesignManager - SAVING DESIGN:', design);
    
    try {
      triggerSyncEvents(design);
      toast.success(`Design sauvegardé ! Site: "${design.siteName}"`);
      console.log('✅ WebsiteDesignManager - Design saved successfully');
    } catch (error) {
      console.error('❌ WebsiteDesignManager - Error saving design:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 WebsiteDesignManager - Resetting design to default');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    triggerSyncEvents(defaultDesign);
    toast.success('Design réinitialisé');
  };

  return (
    <div className="space-y-6">
      {/* Debug info plus détaillé */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <p className="text-sm text-green-800">
            <strong>🎯 CURRENT STATE:</strong> Nom: "{design.siteName}" | Logo: {design.logo ? '✅' : '❌'}
          </p>
          <p className="text-sm text-green-600 mt-1">
            💾 localStorage websiteDesign: {localStorage.getItem('websiteDesign') ? 'EXISTS' : 'MISSING'}
          </p>
          <p className="text-sm text-green-600">
            🎯 Document title: "{document.title}"
          </p>
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
        <Button onClick={saveDesign} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          FORCER LA SAUVEGARDE
        </Button>
        <Button variant="outline" onClick={resetDesign}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

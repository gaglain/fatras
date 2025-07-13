
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

  const triggerSyncEvents = (designData: SiteDesign) => {
    console.log('🚀 Triggering sync events for design');
    
    localStorage.setItem('websiteDesign', JSON.stringify(designData));
    
    const events = ['websiteDesignUpdated', 'websiteDesignSaved'];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { detail: designData }));
      console.log(`✅ Event ${eventName} dispatched`);
    });
    
    // Événement storage
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'websiteDesign',
      newValue: JSON.stringify(designData),
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href
    }));
  };

  const saveDesign = () => {
    console.log('💾 Saving design:', design);
    
    try {
      triggerSyncEvents(design);
      toast.success('Design sauvegardé avec succès !');
      console.log('✅ Design saved and events triggered');
    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 Resetting design to default');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    triggerSyncEvents(defaultDesign);
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

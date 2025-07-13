
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

  const triggerSync = (designData: SiteDesign) => {
    console.log('🚀 Triggering sync for design:', designData.siteName);
    
    // Sauvegarder
    localStorage.setItem('websiteDesign', JSON.stringify(designData));
    
    // Déclencher TOUS les événements possibles pour garantir la synchronisation
    const events = [
      'websiteDesignUpdated', 
      'websiteDesignSaved',
      'websiteSettingsUpdated' // Pour compatibilité
    ];
    
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { detail: designData });
      window.dispatchEvent(event);
      console.log(`✅ Event ${eventName} dispatched`);
    });
    
    // Événement storage manuel pour forcer la mise à jour
    const storageEvent = new StorageEvent('storage', {
      key: 'websiteDesign',
      newValue: JSON.stringify(designData),
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href
    });
    window.dispatchEvent(storageEvent);
    
    // Force un refresh des éléments DOM après un délai
    setTimeout(() => {
      // Forcer la mise à jour du titre
      document.title = designData.siteName;
      
      // Forcer la mise à jour des éléments
      document.querySelectorAll('.site-name, [data-site-name]').forEach(el => {
        el.textContent = designData.siteName;
      });
      
      console.log('🔄 DOM force updated');
    }, 100);
  };

  const saveDesign = () => {
    console.log('💾 Saving design:', design);
    
    try {
      triggerSync(design);
      toast.success('Design sauvegardé et synchronisé !');
      console.log('✅ Design saved and synced');
    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetDesign = () => {
    console.log('🔄 Resetting design to default');
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    triggerSync(defaultDesign);
    toast.success('Design réinitialisé et synchronisé');
  };

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <p className="text-sm text-green-800">
            <strong>Debug:</strong> Nom actuel: "{design.siteName}" | Logo: {design.logo ? 'Défini' : 'Non défini'}
          </p>
          <p className="text-sm text-green-600 mt-1">
            💡 <strong>Synchronisation simplifiée :</strong> Les changements sont maintenant synchronisés directement
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

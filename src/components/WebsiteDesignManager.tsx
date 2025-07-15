
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
    setDesign(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const saveDesign = () => {
    setIsSaving(true);
    console.log('💾 SAVING DESIGN:', design);
    
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('websiteDesign', JSON.stringify(design));
      localStorage.setItem('websiteSettings', JSON.stringify({
        siteName: design.siteName,
        logo: design.logo
      }));

      // Mettre à jour le titre immédiatement
      document.title = design.siteName;

      // Déclencher l'événement de synchronisation
      const event = new CustomEvent('siteConfigChanged', { 
        detail: design 
      });
      window.dispatchEvent(event);

      console.log('✅ Design saved successfully');
      toast.success(`Design sauvegardé ! Site: "${design.siteName}"`);

    } catch (error) {
      console.error('❌ Error saving design:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
    localStorage.removeItem('websiteDesign');
    localStorage.removeItem('websiteSettings');
    document.title = defaultDesign.siteName;
    
    const event = new CustomEvent('siteConfigChanged', { 
      detail: defaultDesign 
    });
    window.dispatchEvent(event);
    
    toast.success('Design réinitialisé');
  };

  // Vérification en temps réel
  const designExists = localStorage.getItem('websiteDesign') !== null;
  const settingsExists = localStorage.getItem('websiteSettings') !== null;

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            <strong>🎯 ÉTAT ACTUEL:</strong> Nom: "{design.siteName}"
          </p>
          <p className="text-sm text-blue-600 mt-1">
            💾 websiteDesign: {designExists ? '✅ EXISTS' : '❌ MISSING'}
          </p>
          <p className="text-sm text-blue-600">
            💾 websiteSettings: {settingsExists ? '✅ EXISTS' : '❌ MISSING'}
          </p>
          <p className="text-sm text-blue-600">
            📄 Document title: "{document.title}"
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

      <div className="flex gap-4">
        <Button 
          onClick={saveDesign} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button variant="outline" onClick={resetDesign} disabled={isSaving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-green-800">🧪 TEST SIMPLE:</h3>
          <p className="text-sm text-green-600 mt-1">
            1. Changez le nom ci-dessus<br/>
            2. Cliquez sur "Sauvegarder"<br/>
            3. Vérifiez que les localStorage passent à "EXISTS"<br/>
            4. Allez sur /front - le nom devrait changer
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

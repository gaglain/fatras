
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { useWebsiteDesign } from '@/hooks/useWebsiteDesign';
import { LogoSection } from './website-design/LogoSection';
import { ColorSection } from './website-design/ColorSection';
import { LayoutSection } from './website-design/LayoutSection';

export const WebsiteDesignManager: React.FC = () => {
  const { design, loading, saving, updateDesign, saveDesign, resetDesign } = useWebsiteDesign();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du design...</span>
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof design, value: string) => {
    updateDesign(field, value);
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            <strong>🎯 ÉTAT ACTUEL:</strong> Nom: "{design.site_name}"
          </p>
          <p className="text-sm text-blue-600">
            📄 Document title: "{document.title}"
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogoSection
          siteName={design.site_name}
          logo={design.logo}
          onSiteNameChange={(value) => handleInputChange('site_name', value)}
          onLogoChange={(value) => handleInputChange('logo', value)}
        />
        
        <ColorSection
          design={{
            site_name: design.site_name,
            logo: design.logo,
            primary_color: design.primary_color,
            secondary_color: design.secondary_color,
            accent_color: design.accent_color,
            header_bg: design.header_bg,
            footer_bg: design.footer_bg,
            text_color: design.text_color,
            link_color: design.link_color
          }}
          onInputChange={(field, value) => {
            const fieldMap: Record<string, keyof typeof design> = {
              'primaryColor': 'primary_color',
              'secondaryColor': 'secondary_color',
              'accentColor': 'accent_color',
              'headerBg': 'header_bg',
              'footerBg': 'footer_bg',
              'textColor': 'text_color',
              'linkColor': 'link_color'
            };
            const mappedField = fieldMap[field] || field as keyof typeof design;
            handleInputChange(mappedField, value);
          }}
        />
      </div>

      <LayoutSection />

      <div className="flex gap-4">
        <Button 
          onClick={saveDesign} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button variant="outline" onClick={resetDesign} disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
      
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-green-800">✅ SUPABASE ACTIVÉ:</h3>
          <p className="text-sm text-green-600 mt-1">
            Le design est maintenant sauvegardé dans Supabase<br/>
            Plus besoin de localStorage - tout est persistant!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

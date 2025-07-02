
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SEOManagerProps {
  onSave: (seoData: any) => void;
}

export const SEOManager: React.FC<SEOManagerProps> = ({ onSave }) => {
  const [seoData, setSeoData] = useState({
    siteName: '',
    siteDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    robotsTxt: 'User-agent: *\nAllow: /',
    canonicalUrl: '',
    structuredData: ''
  });

  const handleSave = () => {
    try {
      onSave(seoData);
      toast.success('Paramètres SEO sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres SEO');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Métadonnées de base */}
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Métadonnées de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={seoData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="MusiConnect"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description du site</Label>
              <Textarea
                id="siteDescription"
                value={seoData.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="Plateforme de gestion d'artistes et d'événements musicaux"
                rows={3}
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
            <div>
              <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
              <Input
                id="keywords"
                value={seoData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="musique, artistes, événements, concerts"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Open Graph */}
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Open Graph & Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ogTitle">Titre Open Graph</Label>
              <Input
                id="ogTitle"
                value={seoData.ogTitle}
                onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                placeholder="MusiConnect - Gestion d'artistes"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
            <div>
              <Label htmlFor="ogDescription">Description Open Graph</Label>
              <Textarea
                id="ogDescription"
                value={seoData.ogDescription}
                onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                placeholder="Découvrez notre plateforme de gestion d'artistes"
                rows={3}
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
            <div>
              <Label htmlFor="ogImage">Image Open Graph (URL)</Label>
              <Input
                id="ogImage"
                value={seoData.ogImage}
                onChange={(e) => handleInputChange('ogImage', e.target.value)}
                placeholder="https://exemple.com/image-og.jpg"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paramètres avancés */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle>Paramètres avancés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="canonicalUrl">URL canonique</Label>
            <Input
              id="canonicalUrl"
              value={seoData.canonicalUrl}
              onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
              placeholder="https://votre-site.com"
              style={{
                backgroundColor: 'var(--app-background, #ffffff)',
                color: 'var(--app-text, #18181b)',
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}
            />
          </div>
          <div>
            <Label htmlFor="robotsTxt">Robots.txt</Label>
            <Textarea
              id="robotsTxt"
              value={seoData.robotsTxt}
              onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
              rows={4}
              style={{
                backgroundColor: 'var(--app-background, #ffffff)',
                color: 'var(--app-text, #18181b)',
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}
            />
          </div>
          <div>
            <Label htmlFor="structuredData">Données structurées (JSON-LD)</Label>
            <Textarea
              id="structuredData"
              value={seoData.structuredData}
              onChange={(e) => handleInputChange('structuredData', e.target.value)}
              placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "MusiConnect"}'
              rows={6}
              style={{
                backgroundColor: 'var(--app-background, #ffffff)',
                color: 'var(--app-text, #18181b)',
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          style={{
            backgroundColor: 'var(--app-button-bg, #1632f4)',
            color: 'var(--app-button-text, #ffffff)'
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres SEO
        </Button>
      </div>
    </div>
  );
};

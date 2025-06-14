
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SiteColors {
  primary: string;
  primaryDark: string;
  accentRed: string;
  accentPink: string;
}

interface SiteCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteCustomizer: React.FC<SiteCustomizerProps> = ({ isOpen, onClose }) => {
  const [colors, setColors] = useState<SiteColors>({
    primary: '#1632f4',
    primaryDark: '#2006a3',
    accentRed: '#ec5f65',
    accentPink: '#f19e9c'
  });

  useEffect(() => {
    // Charger les couleurs sauvegardées
    const savedColors = localStorage.getItem('siteColors');
    if (savedColors) {
      try {
        setColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Erreur lors du chargement des couleurs:', e);
      }
    }
  }, []);

  const handleColorChange = (colorKey: keyof SiteColors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const applySiteColors = () => {
    const root = document.documentElement;
    
    // Convertir hex en RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Appliquer les couleurs
    Object.entries(colors).forEach(([key, hex]) => {
      const rgb = hexToRgb(hex);
      if (rgb) {
        const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, `${rgb.r} ${rgb.g} ${rgb.b}`);
      }
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('siteColors', JSON.stringify(colors));
    toast.success('Couleurs du site appliquées');
  };

  const resetColors = () => {
    const defaultColors = {
      primary: '#1632f4',
      primaryDark: '#2006a3',
      accentRed: '#ec5f65',
      accentPink: '#f19e9c'
    };
    setColors(defaultColors);
    localStorage.removeItem('siteColors');
    
    // Réinitialiser les variables CSS
    const root = document.documentElement;
    Object.keys(defaultColors).forEach(key => {
      const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.removeProperty(cssVarName);
    });
    
    toast.success('Couleurs réinitialisées');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personnaliser les couleurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="primary">Couleur principale</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primaryDark">Couleur principale foncée</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryDark"
                  type="color"
                  value={colors.primaryDark}
                  onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={colors.primaryDark}
                  onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accentRed">Couleur d'accent rouge</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accentRed"
                  type="color"
                  value={colors.accentRed}
                  onChange={(e) => handleColorChange('accentRed', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={colors.accentRed}
                  onChange={(e) => handleColorChange('accentRed', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accentPink">Couleur d'accent rose</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accentPink"
                  type="color"
                  value={colors.accentPink}
                  onChange={(e) => handleColorChange('accentPink', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={colors.accentPink}
                  onChange={(e) => handleColorChange('accentPink', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={applySiteColors} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
            <Button variant="outline" onClick={resetColors}>
              Réinitialiser
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

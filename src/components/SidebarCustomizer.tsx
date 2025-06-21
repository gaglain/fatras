
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarColors {
  sidebarBg?: string;
  sidebarText?: string;
  sidebarActiveItemBg?: string;
  sidebarActiveItemText?: string;
  sidebarIconLight?: string;
  sidebarIconDark?: string;
}

export const SidebarCustomizer: React.FC = () => {
  const { theme } = useTheme();
  const [colors, setColors] = useState<SidebarColors>({
    sidebarBg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
    sidebarText: theme === 'dark' ? '#ffffff' : '#18181b',
    sidebarActiveItemBg: '#1632f4',
    sidebarActiveItemText: '#ffffff',
    sidebarIconLight: '#1632f4',
    sidebarIconDark: '#ffffff'
  });

  useEffect(() => {
    const savedColors = localStorage.getItem("customColors");
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setColors(prev => ({
          ...prev,
          sidebarBg: parsed.sidebarBg || prev.sidebarBg,
          sidebarText: parsed.sidebarText || prev.sidebarText,
          sidebarActiveItemBg: parsed.sidebarActiveItemBg || prev.sidebarActiveItemBg,
          sidebarActiveItemText: parsed.sidebarActiveItemText || prev.sidebarActiveItemText,
          sidebarIconLight: parsed.sidebarIconLight || prev.sidebarIconLight,
          sidebarIconDark: parsed.sidebarIconDark || prev.sidebarIconDark
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des couleurs de la sidebar:', error);
      }
    }
  }, [theme]);

  const handleColorChange = (colorKey: keyof SidebarColors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const saveColors = () => {
    const existingColors = JSON.parse(localStorage.getItem("customColors") || "{}");
    const updatedColors = { ...existingColors, ...colors };
    
    localStorage.setItem("customColors", JSON.stringify(updatedColors));
    window.dispatchEvent(new CustomEvent('customColorsChanged'));
    
    console.log('✅ Couleurs de la sidebar sauvegardées');
  };

  const resetToDefaults = () => {
    const defaultColors = {
      sidebarBg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
      sidebarText: theme === 'dark' ? '#ffffff' : '#18181b',
      sidebarActiveItemBg: '#1632f4',
      sidebarActiveItemText: '#ffffff',
      sidebarIconLight: '#1632f4',
      sidebarIconDark: '#ffffff'
    };
    setColors(defaultColors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnalisation de la Sidebar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sidebarBg">Arrière-plan de la sidebar</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarBg"
                type="color"
                value={colors.sidebarBg}
                onChange={(e) => handleColorChange('sidebarBg', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarBg}
                onChange={(e) => handleColorChange('sidebarBg', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sidebarText">Texte de la sidebar</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarText"
                type="color"
                value={colors.sidebarText}
                onChange={(e) => handleColorChange('sidebarText', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarText}
                onChange={(e) => handleColorChange('sidebarText', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#18181b"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sidebarActiveItemBg">Arrière-plan élément actif</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarActiveItemBg"
                type="color"
                value={colors.sidebarActiveItemBg}
                onChange={(e) => handleColorChange('sidebarActiveItemBg', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarActiveItemBg}
                onChange={(e) => handleColorChange('sidebarActiveItemBg', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#1632f4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sidebarActiveItemText">Texte élément actif</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarActiveItemText"
                type="color"
                value={colors.sidebarActiveItemText}
                onChange={(e) => handleColorChange('sidebarActiveItemText', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarActiveItemText}
                onChange={(e) => handleColorChange('sidebarActiveItemText', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sidebarIconLight">Couleur icônes (mode clair)</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarIconLight"
                type="color"
                value={colors.sidebarIconLight}
                onChange={(e) => handleColorChange('sidebarIconLight', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarIconLight}
                onChange={(e) => handleColorChange('sidebarIconLight', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#1632f4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sidebarIconDark">Couleur icônes (mode sombre)</Label>
            <div className="flex items-center space-x-2">
              <input
                id="sidebarIconDark"
                type="color"
                value={colors.sidebarIconDark}
                onChange={(e) => handleColorChange('sidebarIconDark', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors.sidebarIconDark}
                onChange={(e) => handleColorChange('sidebarIconDark', e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={saveColors} className="flex-1">
            Sauvegarder les couleurs de la sidebar
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

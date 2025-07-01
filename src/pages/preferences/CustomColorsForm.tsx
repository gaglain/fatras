import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, RotateCcw, Palette } from "lucide-react";
import { useTheme } from "next-themes";

interface CustomColors {
  background: string;
  text: string;
  cardBg: string;
  cardText: string;
  buttonBg: string;
  buttonText: string;
  backgroundDark: string;
  textDark: string;
  cardBgDark: string;
  cardTextDark: string;
  buttonBgDark: string;
  buttonTextDark: string;
  chatWidgetBg: string;
  chatWidgetIcon: string;
  notificationBg: string;
  notificationText: string;
  notificationBorder: string;
  notificationBadgeBg: string;
  notificationBadgeText: string;
  notificationButtonBg: string;
  notificationButtonText: string;
  notificationRedDot: string;
}

const defaultColors: CustomColors = {
  background: "#ffffff",
  text: "#18181b",
  cardBg: "#ffffff",
  cardText: "#18181b",
  buttonBg: "#1632f4",
  buttonText: "#ffffff",
  backgroundDark: "#0f0f0f",
  textDark: "#ffffff",
  cardBgDark: "#1a1a1a",
  cardTextDark: "#ffffff",
  buttonBgDark: "#ffffff",
  buttonTextDark: "#000000",
  chatWidgetBg: "#1632f4",
  chatWidgetIcon: "#ffffff",
  notificationBg: "#ffffff",
  notificationText: "#18181b",
  notificationBorder: "#e5e7eb",
  notificationBadgeBg: "#ef4444",
  notificationBadgeText: "#ffffff",
  notificationButtonBg: "#f3f4f6",
  notificationButtonText: "#374151",
  notificationRedDot: "#ef4444",
};

export const CustomColorsForm: React.FC = () => {
  const { theme } = useTheme();
  const [colors, setColors] = useState<CustomColors>(defaultColors);
  const [hasChanges, setHasChanges] = useState(false);

  const applyColorsToDocument = (newColors: CustomColors) => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    
    console.log('🎨 Applying colors immediately:', { newColors, isDark });
    
    // Variables CSS personnalisées pour l'application
    root.style.setProperty('--app-background', isDark ? newColors.backgroundDark : newColors.background);
    root.style.setProperty('--app-text', isDark ? newColors.textDark : newColors.text);
    root.style.setProperty('--app-card-bg', isDark ? newColors.cardBgDark : newColors.cardBg);
    root.style.setProperty('--app-card-text', isDark ? newColors.cardTextDark : newColors.cardText);
    root.style.setProperty('--app-button-bg', isDark ? newColors.buttonBgDark : newColors.buttonBg);
    root.style.setProperty('--app-button-text', isDark ? newColors.buttonTextDark : newColors.buttonText);
    root.style.setProperty('--app-chat-widget-bg', newColors.chatWidgetBg);
    root.style.setProperty('--app-chat-widget-icon', newColors.chatWidgetIcon);
    
    // Variables pour les notifications
    root.style.setProperty('--notification-bg', newColors.notificationBg);
    root.style.setProperty('--notification-text', newColors.notificationText);
    root.style.setProperty('--notification-border', newColors.notificationBorder);
    root.style.setProperty('--notification-badge-bg', newColors.notificationBadgeBg);
    root.style.setProperty('--notification-badge-text', newColors.notificationBadgeText);
    root.style.setProperty('--notification-button-bg', newColors.notificationButtonBg);
    root.style.setProperty('--notification-button-text', newColors.notificationButtonText);
    root.style.setProperty('--notification-red-dot', newColors.notificationRedDot);
    
    // Appliquer directement au body et html
    const bgColor = isDark ? newColors.backgroundDark : newColors.background;
    const textColor = isDark ? newColors.textDark : newColors.text;
    
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
    document.documentElement.style.backgroundColor = bgColor;
    
    // Forcer la mise à jour des variables Tailwind CSS
    const hslValues = {
      background: isDark ? '222.2 84% 4.9%' : '0 0% 100%',
      foreground: isDark ? '210 40% 98%' : '222.2 84% 4.9%',
      card: isDark ? '222.2 84% 4.9%' : '0 0% 100%',
      'card-foreground': isDark ? '210 40% 98%' : '222.2 84% 4.9%'
    };
    
    Object.entries(hslValues).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Déclencher l'événement de changement de couleurs
    window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: newColors }));
    window.dispatchEvent(new CustomEvent('customColorsApplied', { detail: newColors }));
    
    console.log('✅ Colors applied successfully');
  };

  useEffect(() => {
    const loadColors = () => {
      const savedColors = localStorage.getItem("customColors");
      if (savedColors) {
        try {
          const parsed = JSON.parse(savedColors);
          const mergedColors = { ...defaultColors, ...parsed };
          setColors(mergedColors);
          applyColorsToDocument(mergedColors);
        } catch (error) {
          console.error("Error loading colors:", error);
          setColors(defaultColors);
          applyColorsToDocument(defaultColors);
        }
      } else {
        setColors(defaultColors);
        applyColorsToDocument(defaultColors);
      }
    };

    loadColors();
  }, [theme]);

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    setHasChanges(true);
    applyColorsToDocument(newColors);
  };

  const saveColors = () => {
    try {
      localStorage.setItem("customColors", JSON.stringify(colors));
      applyColorsToDocument(colors);
      setHasChanges(false);
      
      // Déclencher tous les événements de synchronisation
      window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: colors }));
      window.dispatchEvent(new CustomEvent('customColorsApplied', { detail: colors }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'customColors',
        newValue: JSON.stringify(colors),
        storageArea: localStorage
      }));
      
      toast.success("Couleurs sauvegardées et appliquées !");
    } catch (error) {
      console.error("Error saving colors:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const resetColors = () => {
    setColors(defaultColors);
    localStorage.removeItem("customColors");
    applyColorsToDocument(defaultColors);
    setHasChanges(false);
    
    // Déclencher les événements de réinitialisation
    window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: defaultColors }));
    window.dispatchEvent(new CustomEvent('customColorsApplied', { detail: defaultColors }));
    
    toast.success("Couleurs remises par défaut !");
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex space-x-2 items-center">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 p-1 border rounded cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Personnalisation des Couleurs</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Les changements s'appliquent en temps réel. Sauvegardez pour les conserver.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">🌞 Mode Clair</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput label="Arrière-plan principal" value={colors.background} onChange={(value) => handleColorChange("background", value)} />
              <ColorInput label="Texte principal" value={colors.text} onChange={(value) => handleColorChange("text", value)} />
              <ColorInput label="Arrière-plan des cartes" value={colors.cardBg} onChange={(value) => handleColorChange("cardBg", value)} />
              <ColorInput label="Texte des cartes" value={colors.cardText} onChange={(value) => handleColorChange("cardText", value)} />
              <ColorInput label="Arrière-plan des boutons" value={colors.buttonBg} onChange={(value) => handleColorChange("buttonBg", value)} />
              <ColorInput label="Texte des boutons" value={colors.buttonText} onChange={(value) => handleColorChange("buttonText", value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">🌙 Mode Sombre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput label="Arrière-plan principal" value={colors.backgroundDark} onChange={(value) => handleColorChange("backgroundDark", value)} />
              <ColorInput label="Texte principal" value={colors.textDark} onChange={(value) => handleColorChange("textDark", value)} />
              <ColorInput label="Arrière-plan des cartes" value={colors.cardBgDark} onChange={(value) => handleColorChange("cardBgDark", value)} />
              <ColorInput label="Texte des cartes" value={colors.cardTextDark} onChange={(value) => handleColorChange("cardTextDark", value)} />
              <ColorInput label="Arrière-plan des boutons" value={colors.buttonBgDark} onChange={(value) => handleColorChange("buttonBgDark", value)} />
              <ColorInput label="Texte des boutons" value={colors.buttonTextDark} onChange={(value) => handleColorChange("buttonTextDark", value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">💬 Widget de Chat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput label="Arrière-plan du widget" value={colors.chatWidgetBg} onChange={(value) => handleColorChange("chatWidgetBg", value)} />
              <ColorInput label="Couleur de l'icône" value={colors.chatWidgetIcon} onChange={(value) => handleColorChange("chatWidgetIcon", value)} />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={saveColors} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </Button>
            
            <Button onClick={resetColors} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Réinitialiser</span>
            </Button>
            
            {hasChanges && (
              <p className="text-sm flex items-center text-yellow-600">
                ⚠️ Changements non sauvegardés
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

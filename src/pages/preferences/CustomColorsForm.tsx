
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, RotateCcw, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomColors {
  // Mode clair
  background: string;
  text: string;
  cardBg: string;
  cardText: string;
  buttonBg: string;
  buttonText: string;
  
  // Mode sombre
  backgroundDark: string;
  textDark: string;
  cardBgDark: string;
  cardTextDark: string;
  buttonBgDark: string;
  buttonTextDark: string;
  
  // Chat widget
  chatWidgetBg: string;
  chatWidgetIcon: string;
  
  // Notifications
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
  // Mode clair
  background: "#ffffff",
  text: "#18181b",
  cardBg: "#ffffff",
  cardText: "#18181b",
  buttonBg: "#1632f4",
  buttonText: "#ffffff",
  
  // Mode sombre
  backgroundDark: "#0f0f0f",
  textDark: "#ffffff",
  cardBgDark: "#1a1a1a",
  cardTextDark: "#ffffff",
  buttonBgDark: "#ffffff",
  buttonTextDark: "#000000",
  
  // Chat widget
  chatWidgetBg: "#1632f4",
  chatWidgetIcon: "#ffffff",
  
  // Notifications
  notificationBg: "#ffffff",
  notificationText: "#18181b",
  notificationBorder: "#e5e7eb",
  notificationBadgeBg: "#ef4444",
  notificationBadgeText: "#ffffff",
  notificationButtonBg: "#f3f4f6",
  notificationButtonText: "#374151",
  notificationRedDot: "#ef4444",
};

// Fonction pour appliquer les couleurs immédiatement
const applyColors = (colors: CustomColors, theme: string) => {
  const root = document.documentElement;
  const isDark = theme === 'dark';
  
  console.log('🎨 Applying custom colors:', colors);
  
  // Variables CSS principales
  root.style.setProperty('--app-background', isDark ? colors.backgroundDark : colors.background);
  root.style.setProperty('--app-text', isDark ? colors.textDark : colors.text);
  root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg);
  root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText);
  root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg);
  root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText);
  root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg);
  root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon);
  
  // Variables CSS pour les notifications
  root.style.setProperty('--notification-bg', colors.notificationBg);
  root.style.setProperty('--notification-text', colors.notificationText);
  root.style.setProperty('--notification-border', colors.notificationBorder);
  root.style.setProperty('--notification-badge-bg', colors.notificationBadgeBg);
  root.style.setProperty('--notification-badge-text', colors.notificationBadgeText);
  root.style.setProperty('--notification-button-bg', colors.notificationButtonBg);
  root.style.setProperty('--notification-button-text', colors.notificationButtonText);
  root.style.setProperty('--notification-red-dot', colors.notificationRedDot);
  
  // Forcer l'application sur body
  document.body.style.backgroundColor = isDark ? colors.backgroundDark : colors.background;
  document.body.style.color = isDark ? colors.textDark : colors.text;
  
  // Sauvegarder
  localStorage.setItem("customColors", JSON.stringify(colors));
  
  console.log('✅ Custom colors applied successfully');
};

export const CustomColorsForm: React.FC = () => {
  const { theme } = useTheme();
  const [colors, setColors] = useState<CustomColors>(defaultColors);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadColors = () => {
      const savedColors = localStorage.getItem("customColors");
      if (savedColors) {
        try {
          const parsed = JSON.parse(savedColors);
          const mergedColors = { ...defaultColors, ...parsed };
          setColors(mergedColors);
          applyColors(mergedColors, theme);
        } catch (error) {
          console.error("Erreur lors du chargement des couleurs:", error);
          setColors(defaultColors);
          applyColors(defaultColors, theme);
        }
      } else {
        setColors(defaultColors);
        applyColors(defaultColors, theme);
      }
    };

    loadColors();
  }, [theme]);

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    console.log('🎨 Color change:', key, value);
    
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    setHasChanges(true);
    
    // Application immédiate
    applyColors(newColors, theme);
  };

  const saveColors = () => {
    applyColors(colors, theme);
    setHasChanges(false);
    toast.success("Couleurs sauvegardées !");
  };

  const resetColors = () => {
    setColors(defaultColors);
    applyColors(defaultColors, theme);
    localStorage.removeItem("customColors");
    setHasChanges(false);
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
            Les changements s'appliquent en temps réel
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Clair */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              🌞 Mode Clair
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Arrière-plan principal"
                value={colors.background}
                onChange={(value) => handleColorChange("background", value)}
              />
              <ColorInput
                label="Texte principal"
                value={colors.text}
                onChange={(value) => handleColorChange("text", value)}
              />
              <ColorInput
                label="Arrière-plan des cartes"
                value={colors.cardBg}
                onChange={(value) => handleColorChange("cardBg", value)}
              />
              <ColorInput
                label="Texte des cartes"
                value={colors.cardText}
                onChange={(value) => handleColorChange("cardText", value)}
              />
              <ColorInput
                label="Arrière-plan des boutons"
                value={colors.buttonBg}
                onChange={(value) => handleColorChange("buttonBg", value)}
              />
              <ColorInput
                label="Texte des boutons"
                value={colors.buttonText}
                onChange={(value) => handleColorChange("buttonText", value)}
              />
            </div>
          </div>

          {/* Mode Sombre */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              🌙 Mode Sombre
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Arrière-plan principal"
                value={colors.backgroundDark}
                onChange={(value) => handleColorChange("backgroundDark", value)}
              />
              <ColorInput
                label="Texte principal"
                value={colors.textDark}
                onChange={(value) => handleColorChange("textDark", value)}
              />
              <ColorInput
                label="Arrière-plan des cartes"
                value={colors.cardBgDark}
                onChange={(value) => handleColorChange("cardBgDark", value)}
              />
              <ColorInput
                label="Texte des cartes"
                value={colors.cardTextDark}
                onChange={(value) => handleColorChange("cardTextDark", value)}
              />
              <ColorInput
                label="Arrière-plan des boutons"
                value={colors.buttonBgDark}
                onChange={(value) => handleColorChange("buttonBgDark", value)}
              />
              <ColorInput
                label="Texte des boutons"
                value={colors.buttonTextDark}
                onChange={(value) => handleColorChange("buttonTextDark", value)}
              />
            </div>
          </div>

          {/* Chat Widget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              💬 Widget de Chat
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Arrière-plan du widget"
                value={colors.chatWidgetBg}
                onChange={(value) => handleColorChange("chatWidgetBg", value)}
              />
              <ColorInput
                label="Couleur de l'icône"
                value={colors.chatWidgetIcon}
                onChange={(value) => handleColorChange("chatWidgetIcon", value)}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              🔔 Notifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Arrière-plan des notifications"
                value={colors.notificationBg}
                onChange={(value) => handleColorChange("notificationBg", value)}
              />
              <ColorInput
                label="Texte des notifications"
                value={colors.notificationText}
                onChange={(value) => handleColorChange("notificationText", value)}
              />
              <ColorInput
                label="Bordure des notifications"
                value={colors.notificationBorder}
                onChange={(value) => handleColorChange("notificationBorder", value)}
              />
              <ColorInput
                label="Arrière-plan des badges"
                value={colors.notificationBadgeBg}
                onChange={(value) => handleColorChange("notificationBadgeBg", value)}
              />
              <ColorInput
                label="Texte des badges"
                value={colors.notificationBadgeText}
                onChange={(value) => handleColorChange("notificationBadgeText", value)}
              />
              <ColorInput
                label="Arrière-plan des boutons"
                value={colors.notificationButtonBg}
                onChange={(value) => handleColorChange("notificationButtonBg", value)}
              />
              <ColorInput
                label="Texte des boutons"
                value={colors.notificationButtonText}
                onChange={(value) => handleColorChange("notificationButtonText", value)}
              />
              <ColorInput
                label="Point rouge (non lu)"
                value={colors.notificationRedDot}
                onChange={(value) => handleColorChange("notificationRedDot", value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button 
              onClick={saveColors} 
              disabled={!hasChanges}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </Button>
            
            <Button 
              onClick={resetColors} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Réinitialiser</span>
            </Button>
            
            {hasChanges && (
              <p className="text-sm text-orange-600 flex items-center">
                ⚠️ Changements non sauvegardés
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

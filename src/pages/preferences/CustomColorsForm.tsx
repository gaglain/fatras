
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
  
  // Chat widget (même pour les deux modes)
  chatWidgetBg: string;
  chatWidgetIcon: string;
  
  // Sidebar - Mode clair
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveItemBg: string;
  sidebarActiveItemText: string;
  sidebarIconLight: string;
  
  // Sidebar - Mode sombre
  sidebarBgDark: string;
  sidebarTextDark: string;
  sidebarActiveItemBgDark: string;
  sidebarActiveItemTextDark: string;
  sidebarIconDark: string;
  
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
  backgroundDark: "#18181b",
  textDark: "#ffffff",
  cardBgDark: "#22223a",
  cardTextDark: "#ffffff",
  buttonBgDark: "#ffffff",
  buttonTextDark: "#1632f4",
  
  // Chat widget
  chatWidgetBg: "#ec5f65",
  chatWidgetIcon: "#ffffff",
  
  // Sidebar - Mode clair
  sidebarBg: "#ffffff",
  sidebarText: "#18181b",
  sidebarActiveItemBg: "#1632f4",
  sidebarActiveItemText: "#ffffff",
  sidebarIconLight: "#1632f4",
  
  // Sidebar - Mode sombre
  sidebarBgDark: "#22223a",
  sidebarTextDark: "#ffffff",
  sidebarActiveItemBgDark: "#1632f4",
  sidebarActiveItemTextDark: "#ffffff",
  sidebarIconDark: "#ffffff",
  
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

// Fonction pour forcer l'application immédiate des couleurs
const forceApplyColors = (colors: CustomColors, currentTheme: string) => {
  const root = document.documentElement;
  const body = document.body;
  const isDark = currentTheme === 'dark';
  
  console.log('🎨 FORCE APPLY - Applying colors for theme:', currentTheme, colors);
  
  // Application FORCÉE des couleurs principales
  const bgColor = isDark ? colors.backgroundDark : colors.background;
  const textColor = isDark ? colors.textDark : colors.text;
  
  // Forcer l'application sur body ET root
  body.style.setProperty('background-color', bgColor, 'important');
  body.style.setProperty('color', textColor, 'important');
  
  // Variables CSS principales
  root.style.setProperty('--app-background', bgColor, 'important');
  root.style.setProperty('--app-text', textColor, 'important');
  root.style.setProperty('--app-card-bg', isDark ? colors.cardBgDark : colors.cardBg, 'important');
  root.style.setProperty('--app-card-text', isDark ? colors.cardTextDark : colors.cardText, 'important');
  root.style.setProperty('--app-button-bg', isDark ? colors.buttonBgDark : colors.buttonBg, 'important');
  root.style.setProperty('--app-button-text', isDark ? colors.buttonTextDark : colors.buttonText, 'important');
  root.style.setProperty('--app-chat-widget-bg', colors.chatWidgetBg, 'important');
  root.style.setProperty('--app-chat-widget-icon', colors.chatWidgetIcon, 'important');
  
  // Variables SIDEBAR
  root.style.setProperty('--custom-sidebarBg', isDark ? colors.sidebarBgDark : colors.sidebarBg, 'important');
  root.style.setProperty('--custom-sidebarText', isDark ? colors.sidebarTextDark : colors.sidebarText, 'important');
  root.style.setProperty('--custom-sidebarActiveItemBg', isDark ? colors.sidebarActiveItemBgDark : colors.sidebarActiveItemBg, 'important');
  root.style.setProperty('--custom-sidebarActiveItemText', isDark ? colors.sidebarActiveItemTextDark : colors.sidebarActiveItemText, 'important');
  root.style.setProperty('--custom-sidebarIconLight', colors.sidebarIconLight, 'important');
  root.style.setProperty('--custom-sidebarIconDark', colors.sidebarIconDark, 'important');
  
  // Variables NOTIFICATIONS
  root.style.setProperty('--custom-notificationBg', colors.notificationBg, 'important');
  root.style.setProperty('--custom-notificationText', colors.notificationText, 'important');
  root.style.setProperty('--custom-notificationBorder', colors.notificationBorder, 'important');
  root.style.setProperty('--custom-notificationBadgeBg', colors.notificationBadgeBg, 'important');
  root.style.setProperty('--custom-notificationBadgeText', colors.notificationBadgeText, 'important');
  root.style.setProperty('--custom-notificationButtonBg', colors.notificationButtonBg, 'important');
  root.style.setProperty('--custom-notificationButtonText', colors.notificationButtonText, 'important');
  root.style.setProperty('--custom-notificationRedDot', colors.notificationRedDot, 'important');
  
  // Force un refresh complet des styles
  const forceValue = Date.now().toString();
  root.style.setProperty('--force-update', forceValue);
  
  // Forcer un reflow du DOM
  document.body.offsetHeight;
  
  console.log('✅ FORCE APPLY - Colors applied successfully');
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
          console.log('🎨 Colors loaded from localStorage:', mergedColors);
        } catch (error) {
          console.error("Erreur lors du chargement des couleurs:", error);
          setColors(defaultColors);
        }
      } else {
        console.log('🎨 No saved colors, using defaults');
        setColors(defaultColors);
      }
    };

    loadColors();
  }, []);

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    console.log('🎨 Color change:', key, value);
    
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    setHasChanges(true);
    
    // Application immédiate pour preview
    forceApplyColors(newColors, theme);
  };

  const saveColors = () => {
    console.log('💾 Saving colors:', colors);
    
    localStorage.setItem("customColors", JSON.stringify(colors));
    
    // Application immédiate après sauvegarde
    forceApplyColors(colors, theme);
    
    // Dispatch event pour déclencher l'application dans d'autres composants
    window.dispatchEvent(new CustomEvent('colorsChanged', { detail: colors }));
    
    setHasChanges(false);
    toast.success("Couleurs sauvegardées et appliquées !");
  };

  const resetColors = () => {
    console.log('🔄 Resetting colors to defaults');
    
    setColors(defaultColors);
    localStorage.removeItem("customColors");
    
    // Application immédiate des couleurs par défaut
    forceApplyColors(defaultColors, theme);
    
    // Dispatch event pour appliquer les couleurs par défaut partout
    window.dispatchEvent(new CustomEvent('colorsChanged', { detail: defaultColors }));
    
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
            Les changements s'appliquent en temps réel. Cliquez sur "Sauvegarder" pour les conserver.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thème Clair */}
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

            {/* Sidebar - Mode Clair */}
            <h4 className="text-md font-medium text-foreground border-b pb-1 mt-6">
              Menu Latéral - Mode Clair
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Fond sidebar"
                value={colors.sidebarBg}
                onChange={(value) => handleColorChange("sidebarBg", value)}
              />
              <ColorInput
                label="Texte sidebar"
                value={colors.sidebarText}
                onChange={(value) => handleColorChange("sidebarText", value)}
              />
              <ColorInput
                label="Fond item actif"
                value={colors.sidebarActiveItemBg}
                onChange={(value) => handleColorChange("sidebarActiveItemBg", value)}
              />
              <ColorInput
                label="Texte item actif"
                value={colors.sidebarActiveItemText}
                onChange={(value) => handleColorChange("sidebarActiveItemText", value)}
              />
              <ColorInput
                label="Couleur des icônes"
                value={colors.sidebarIconLight}
                onChange={(value) => handleColorChange("sidebarIconLight", value)}
              />
            </div>
          </div>

          {/* Thème Sombre */}
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

            {/* Sidebar - Mode Sombre */}
            <h4 className="text-md font-medium text-foreground border-b pb-1 mt-6">
              Menu Latéral - Mode Sombre
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Fond sidebar"
                value={colors.sidebarBgDark}
                onChange={(value) => handleColorChange("sidebarBgDark", value)}
              />
              <ColorInput
                label="Texte sidebar"
                value={colors.sidebarTextDark}
                onChange={(value) => handleColorChange("sidebarTextDark", value)}
              />
              <ColorInput
                label="Fond item actif"
                value={colors.sidebarActiveItemBgDark}
                onChange={(value) => handleColorChange("sidebarActiveItemBgDark", value)}
              />
              <ColorInput
                label="Texte item actif"
                value={colors.sidebarActiveItemTextDark}
                onChange={(value) => handleColorChange("sidebarActiveItemTextDark", value)}
              />
              <ColorInput
                label="Couleur des icônes"
                value={colors.sidebarIconDark}
                onChange={(value) => handleColorChange("sidebarIconDark", value)}
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
              🔔 Centre de Notifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Fond de la popup"
                value={colors.notificationBg}
                onChange={(value) => handleColorChange("notificationBg", value)}
              />
              <ColorInput
                label="Texte principal"
                value={colors.notificationText}
                onChange={(value) => handleColorChange("notificationText", value)}
              />
              <ColorInput
                label="Bordures"
                value={colors.notificationBorder}
                onChange={(value) => handleColorChange("notificationBorder", value)}
              />
              <ColorInput
                label="Badge (nombre)"
                value={colors.notificationBadgeBg}
                onChange={(value) => handleColorChange("notificationBadgeBg", value)}
              />
              <ColorInput
                label="Texte du badge"
                value={colors.notificationBadgeText}
                onChange={(value) => handleColorChange("notificationBadgeText", value)}
              />
              <ColorInput
                label="Boutons de la popup"
                value={colors.notificationButtonBg}
                onChange={(value) => handleColorChange("notificationButtonBg", value)}
              />
              <ColorInput
                label="Texte des boutons"
                value={colors.notificationButtonText}
                onChange={(value) => handleColorChange("notificationButtonText", value)}
              />
              <ColorInput
                label="Point rouge (indicateur)"
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


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
  
  // NOUVELLES VARIABLES SIDEBAR - Mode clair
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveItemBg: string;
  sidebarActiveItemText: string;
  sidebarIconLight: string;
  
  // NOUVELLES VARIABLES SIDEBAR - Mode sombre
  sidebarBgDark: string;
  sidebarTextDark: string;
  sidebarActiveItemBgDark: string;
  sidebarActiveItemTextDark: string;
  sidebarIconDark: string;
  
  // NOUVELLES VARIABLES NOTIFICATIONS
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

export const CustomColorsForm: React.FC = () => {
  const { theme } = useTheme();
  const [colors, setColors] = useState<CustomColors>(defaultColors);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedColors = localStorage.getItem("customColors");
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setColors({ ...defaultColors, ...parsed });
      } catch (error) {
        console.error("Erreur lors du chargement des couleurs:", error);
      }
    }
  }, []);

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveColors = () => {
    localStorage.setItem("customColors", JSON.stringify(colors));
    
    // Dispatch event pour déclencher l'application immédiate
    window.dispatchEvent(new CustomEvent('colorsChanged'));
    
    setHasChanges(false);
    toast.success("Couleurs sauvegardées avec succès !");
  };

  const resetColors = () => {
    setColors(defaultColors);
    localStorage.removeItem("customColors");
    
    // Dispatch event pour appliquer les couleurs par défaut
    window.dispatchEvent(new CustomEvent('colorsChanged'));
    
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

          {/* NOUVELLE SECTION NOTIFICATIONS */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

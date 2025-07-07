
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, RotateCcw, Palette } from "lucide-react";

interface CustomColors {
  // Mode clair
  background: string;
  text: string;
  cardBg: string;
  cardText: string;
  buttonBg: string;
  buttonText: string;
  headerBg: string;
  headerText: string;
  sidebarBg: string;
  sidebarText: string;
  inputBg: string;
  inputText: string;
  borderColor: string;
  // Mode sombre
  backgroundDark: string;
  textDark: string;
  cardBgDark: string;
  cardTextDark: string;
  buttonBgDark: string;
  buttonTextDark: string;
  headerBgDark: string;
  headerTextDark: string;
  sidebarBgDark: string;
  sidebarTextDark: string;
  inputBgDark: string;
  inputTextDark: string;
  borderColorDark: string;
}

const defaultColors: CustomColors = {
  background: "#ffffff",
  text: "#18181b",
  cardBg: "#ffffff",
  cardText: "#18181b",
  buttonBg: "#1632f4",
  buttonText: "#ffffff",
  headerBg: "#ffffff",
  headerText: "#18181b",
  sidebarBg: "#f8fafc",
  sidebarText: "#374151",
  inputBg: "#ffffff",
  inputText: "#18181b",
  borderColor: "#e5e7eb",
  backgroundDark: "#0f0f0f",
  textDark: "#ffffff",
  cardBgDark: "#1a1a1a",
  cardTextDark: "#ffffff",
  buttonBgDark: "#ffffff",
  buttonTextDark: "#000000",
  headerBgDark: "#1a1a1a",
  headerTextDark: "#ffffff",
  sidebarBgDark: "#111827",
  sidebarTextDark: "#d1d5db",
  inputBgDark: "#1f2937",
  inputTextDark: "#ffffff",
  borderColorDark: "#374151",
};

export const CustomColorsForm: React.FC = () => {
  const [colors, setColors] = useState<CustomColors>(defaultColors);

  useEffect(() => {
    const savedColors = localStorage.getItem("customColors");
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setColors({ ...defaultColors, ...parsed });
      } catch (error) {
        console.error("Error loading colors:", error);
      }
    }
  }, []);

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    applyColors(newColors);
  };

  const applyColors = (newColors: CustomColors) => {
    window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: newColors }));
  };

  const saveColors = () => {
    try {
      localStorage.setItem("customColors", JSON.stringify(colors));
      window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: colors }));
      toast.success("Couleurs sauvegardées !");
    } catch (error) {
      console.error("Error saving colors:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const resetColors = () => {
    setColors(defaultColors);
    localStorage.removeItem("customColors");
    applyColors(defaultColors);
    window.dispatchEvent(new CustomEvent('customColorsChanged', { detail: defaultColors }));
    toast.success("Couleurs réinitialisées !");
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
            <span>Couleurs Personnalisées Complètes</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Toutes les options de couleurs pour personnaliser entièrement l'interface.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🌞 Mode Clair</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput label="Arrière-plan général" value={colors.background} onChange={(value) => handleColorChange("background", value)} />
              <ColorInput label="Texte principal" value={colors.text} onChange={(value) => handleColorChange("text", value)} />
              <ColorInput label="Cartes - Fond" value={colors.cardBg} onChange={(value) => handleColorChange("cardBg", value)} />
              <ColorInput label="Cartes - Texte" value={colors.cardText} onChange={(value) => handleColorChange("cardText", value)} />
              <ColorInput label="Boutons - Fond" value={colors.buttonBg} onChange={(value) => handleColorChange("buttonBg", value)} />
              <ColorInput label="Boutons - Texte" value={colors.buttonText} onChange={(value) => handleColorChange("buttonText", value)} />
              <ColorInput label="Header - Fond" value={colors.headerBg} onChange={(value) => handleColorChange("headerBg", value)} />
              <ColorInput label="Header - Texte" value={colors.headerText} onChange={(value) => handleColorChange("headerText", value)} />
              <ColorInput label="Sidebar - Fond" value={colors.sidebarBg} onChange={(value) => handleColorChange("sidebarBg", value)} />
              <ColorInput label="Sidebar - Texte" value={colors.sidebarText} onChange={(value) => handleColorChange("sidebarText", value)} />
              <ColorInput label="Inputs - Fond" value={colors.inputBg} onChange={(value) => handleColorChange("inputBg", value)} />
              <ColorInput label="Inputs - Texte" value={colors.inputText} onChange={(value) => handleColorChange("inputText", value)} />
              <ColorInput label="Bordures" value={colors.borderColor} onChange={(value) => handleColorChange("borderColor", value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🌙 Mode Sombre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput label="Arrière-plan général" value={colors.backgroundDark} onChange={(value) => handleColorChange("backgroundDark", value)} />
              <ColorInput label="Texte principal" value={colors.textDark} onChange={(value) => handleColorChange("textDark", value)} />
              <ColorInput label="Cartes - Fond" value={colors.cardBgDark} onChange={(value) => handleColorChange("cardBgDark", value)} />
              <ColorInput label="Cartes - Texte" value={colors.cardTextDark} onChange={(value) => handleColorChange("cardTextDark", value)} />
              <ColorInput label="Boutons - Fond" value={colors.buttonBgDark} onChange={(value) => handleColorChange("buttonBgDark", value)} />
              <ColorInput label="Boutons - Texte" value={colors.buttonTextDark} onChange={(value) => handleColorChange("buttonTextDark", value)} />
              <ColorInput label="Header - Fond" value={colors.headerBgDark} onChange={(value) => handleColorChange("headerBgDark", value)} />
              <ColorInput label="Header - Texte" value={colors.headerTextDark} onChange={(value) => handleColorChange("headerTextDark", value)} />
              <ColorInput label="Sidebar - Fond" value={colors.sidebarBgDark} onChange={(value) => handleColorChange("sidebarBgDark", value)} />
              <ColorInput label="Sidebar - Texte" value={colors.sidebarTextDark} onChange={(value) => handleColorChange("sidebarTextDark", value)} />
              <ColorInput label="Inputs - Fond" value={colors.inputBgDark} onChange={(value) => handleColorChange("inputBgDark", value)} />
              <ColorInput label="Inputs - Texte" value={colors.inputTextDark} onChange={(value) => handleColorChange("inputTextDark", value)} />
              <ColorInput label="Bordures" value={colors.borderColorDark} onChange={(value) => handleColorChange("borderColorDark", value)} />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

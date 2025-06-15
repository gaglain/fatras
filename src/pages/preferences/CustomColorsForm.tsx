
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const colorFields: { key: string, label: string, default: string }[] = [
  { key: "primary", label: "Primaire", default: "#1632f4" },
  { key: "secondary", label: "Secondaire", default: "#ec5f65" },
  { key: "accent", label: "Accent", default: "#f5a623" },
  { key: "background", label: "Fond (clair)", default: "#ffffff" },
  { key: "backgroundDark", label: "Fond (sombre)", default: "#18181b" },
  { key: "text", label: "Texte principal (clair)", default: "#18181b" },
  { key: "textDark", label: "Texte principal (sombre)", default: "#ffffff" },
  { key: "buttonBg", label: "Bouton fond (clair)", default: "#1632f4" },
  { key: "buttonBgDark", label: "Bouton fond (sombre)", default: "#ffffff" },
  { key: "buttonText", label: "Bouton texte (clair)", default: "#ffffff" },
  { key: "buttonTextDark", label: "Bouton texte (sombre)", default: "#1632f4" },
  { key: "cardBg", label: "Fond carte (clair)", default: "#ffffff" },
  { key: "cardBgDark", label: "Fond carte (sombre)", default: "#22223a" },
  { key: "cardText", label: "Texte carte (clair)", default: "#18181b" },
  { key: "cardTextDark", label: "Texte carte (sombre)", default: "#ffffff" },
  { key: "sidebarIconLight", label: "Couleur icônes menu (clair)", default: "#1632f4" },
  { key: "sidebarIconDark", label: "Couleur icônes menu (sombre)", default: "#ffffff" },
  { key: "chatWidgetBg", label: "Widget messagerie fond", default: "#ec5f65" },
  { key: "chatWidgetIcon", label: "Widget messagerie icône", default: "#ffffff" },
];

type ColorSettings = Record<string, string>;

export const CustomColorsForm: React.FC = () => {
  const [colors, setColors] = useState<ColorSettings>({});

  useEffect(() => {
    const saved = localStorage.getItem("customColors");
    let initial: ColorSettings = {};
    colorFields.forEach(({ key, default: def }) => {
      initial[key] = def;
    });
    if (saved) {
      try {
        initial = { ...initial, ...JSON.parse(saved) };
      } catch {}
    }
    setColors(initial);
    applyColors(initial);
  }, []);

  function applyColors(colorsObj: ColorSettings) {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    console.log('🎨 Applying colors IMMEDIATELY:', { isDark, colorsObj });
    
    // Application IMMÉDIATE et FORCÉE des couleurs
    root.style.setProperty('--app-background', isDark ? colorsObj.backgroundDark : colorsObj.background);
    root.style.setProperty('--app-text', isDark ? colorsObj.textDark : colorsObj.text);
    root.style.setProperty('--app-card-bg', isDark ? colorsObj.cardBgDark : colorsObj.cardBg);
    root.style.setProperty('--app-card-text', isDark ? colorsObj.cardTextDark : colorsObj.cardText);
    root.style.setProperty('--app-button-bg', isDark ? colorsObj.buttonBgDark : colorsObj.buttonBg);
    root.style.setProperty('--app-button-text', isDark ? colorsObj.buttonTextDark : colorsObj.buttonText);
    root.style.setProperty('--app-chat-widget-bg', colorsObj.chatWidgetBg);
    root.style.setProperty('--app-chat-widget-icon', colorsObj.chatWidgetIcon);
    
    // FORCER un reflow/repaint
    root.style.setProperty('--force-update', Date.now().toString());
    
    // FORCER une mise à jour du DOM
    setTimeout(() => {
      document.body.style.display = 'none';
      document.body.offsetHeight; // trigger reflow
      document.body.style.display = '';
    }, 0);
    
    console.log('✅ Colors applied and forced update triggered');
  }

  function handleChange(key: string, value: string) {
    setColors((prev) => {
      const next = { ...prev, [key]: value };
      applyColors(next);
      return next;
    });
  }

  function handleSave() {
    try {
      localStorage.setItem("customColors", JSON.stringify(colors));
      applyColors(colors);
      
      // Déclencher un événement global
      window.dispatchEvent(new CustomEvent('colorsChanged', { detail: colors }));
      
      toast.success("✅ Couleurs sauvegardées et appliquées avec succès !");
      console.log('💾 Colors saved:', colors);
    } catch (error) {
      toast.error("❌ Erreur lors de la sauvegarde des couleurs");
      console.error('❌ Save error:', error);
    }
  }

  function handleReset() {
    const resetColors: ColorSettings = {};
    colorFields.forEach(({ key, default: def }) => {
      resetColors[key] = def;
    });
    setColors(resetColors);
    applyColors(resetColors);
    localStorage.setItem("customColors", JSON.stringify(resetColors));
    
    window.dispatchEvent(new CustomEvent('colorsChanged', { detail: resetColors }));
    
    toast.success("🔄 Couleurs réinitialisées avec succès !");
    console.log('🔄 Colors reset to defaults');
  }

  return (
    <Card style={{
      background: 'var(--app-card-bg)',
      color: 'var(--app-card-text)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--app-card-text)' }}>
          Couleurs personnalisées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="font-medium" style={{ color: 'var(--app-card-text)' }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={colors[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    className="h-10 w-16 p-1 border-none cursor-pointer"
                    style={{ background: 'transparent' }}
                  />
                  <Input
                    type="text"
                    value={colors[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    className="flex-1"
                    style={{
                      background: 'var(--app-background)',
                      color: 'var(--app-text)',
                      border: '1px solid var(--app-button-bg)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              style={{
                background: 'var(--app-button-bg)',
                color: 'var(--app-button-text)',
                border: '1px solid var(--app-button-bg)'
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              style={{
                background: 'transparent',
                color: 'var(--app-text)',
                border: '1px solid var(--app-button-bg)'
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

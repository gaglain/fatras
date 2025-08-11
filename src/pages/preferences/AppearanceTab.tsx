
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const AppearanceTab: React.FC = () => {
  const [appearance, setAppearance] = useState({
    theme: "light",
    compactMode: false,
    sidebarCollapsed: false
  });

  useEffect(() => {
    const savedAppearance = localStorage.getItem("appearanceSettings");
    if (savedAppearance) {
      try {
        setAppearance(JSON.parse(savedAppearance));
      } catch {}
    }
  }, []);

  const saveAppearanceSettings = () => {
    localStorage.setItem("appearanceSettings", JSON.stringify(appearance));
    toast.success("Paramètres d'apparence sauvegardés");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Apparence de l'application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <Label>Mode compact</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Réduire l'espacement entre les éléments pour afficher plus d'informations à l'écran. 
              Utile pour les écrans plus petits ou pour maximiser l'espace de travail.
            </p>
          </div>
          <Switch
            checked={appearance.compactMode}
            onCheckedChange={checked => setAppearance(prev => ({ ...prev, compactMode: checked }))}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <Label>Sidebar réduite par défaut</Label>
            <p className="text-sm text-muted-foreground mt-1">
              La barre latérale sera repliée au démarrage
            </p>
          </div>
          <Switch
            checked={appearance.sidebarCollapsed}
            onCheckedChange={checked => setAppearance(prev => ({ ...prev, sidebarCollapsed: checked }))}
          />
        </div>
        <Button onClick={saveAppearanceSettings} className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder l'apparence
        </Button>
      </CardContent>
    </Card>
  );
};

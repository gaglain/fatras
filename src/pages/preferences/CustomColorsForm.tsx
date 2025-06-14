
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const colorFields: { key: string, label: string, default: string }[] = [
  { key: "primary", label: "Primaire", default: "#1632f4" },
  { key: "secondary", label: "Secondaire", default: "#ec5f65" },
  { key: "accent", label: "Accent", default: "#f5a623" },
  { key: "background", label: "Fond", default: "#ffffff" },
  { key: "text", label: "Texte principal", default: "#1632f4" },
  { key: "textInverse", label: "Texte inverse", default: "#ffffff" }
];

type ColorSettings = Record<string, string>;

export const CustomColorsForm: React.FC = () => {
  const [colors, setColors] = useState<ColorSettings>({});

  // Charger depuis localStorage + appliquer initialement
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
    Object.entries(colorsObj).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--custom-${key}`, value);
    });
  }

  function handleChange(key: string, value: string) {
    setColors((prev) => {
      const next = { ...prev, [key]: value };
      applyColors(next);
      return next;
    });
  }

  function handleSave() {
    localStorage.setItem("customColors", JSON.stringify(colors));
    applyColors(colors);
  }

  function handleReset() {
    const resetColors: ColorSettings = {};
    colorFields.forEach(({ key, default: def }) => {
      resetColors[key] = def;
    });
    setColors(resetColors);
    applyColors(resetColors);
    localStorage.setItem("customColors", JSON.stringify(resetColors));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Couleurs personnalisées</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="font-medium">{label}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={colors[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    className="h-10 w-16 p-0 border-none bg-transparent"
                  />
                  <Input
                    type="text"
                    value={colors[key] || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    className="ml-2"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-[#1632f4] text-white">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

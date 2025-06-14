
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Globe } from "lucide-react";
import { toast } from "sonner";

export const CompanyTab: React.FC = () => {
  const [companySettings, setCompanySettings] = useState({
    name: "Fatras Booking",
    logo: "",
    favicon: ""
  });

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const savedCompany = localStorage.getItem("companySettings");
    if (savedCompany) {
      try {
        setCompanySettings(JSON.parse(savedCompany));
      } catch {}
    }
  }, []);

  const saveCompanySettings = () => {
    localStorage.setItem("companySettings", JSON.stringify(companySettings));
    // Mettre à jour le favicon si fourni
    if (companySettings.favicon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/x-icon';
      link.href = companySettings.favicon;
    }
    // Mettre à jour le titre
    if (companySettings.name) {
      document.title = companySettings.name;
    }
    window.dispatchEvent(new CustomEvent('companySettingsChanged', { detail: companySettings }));
    toast.success("Paramètres de l'entreprise sauvegardés");
  };

  const handleFileUpload = (type: "logo" | "favicon", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCompanySettings(prev => ({
          ...prev,
          [type]: result
        }));
        toast.success(`${type === "logo" ? "Logo" : "Icône"} chargé avec succès`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Informations de l'entreprise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="company-name">Nom de l'entreprise</Label>
          <Input
            id="company-name"
            value={companySettings.name}
            onChange={e => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nom de votre entreprise"
          />
        </div>
        <div>
          <Label htmlFor="company-logo">Logo de l'entreprise</Label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload('logo', e)}
              />
            </div>
            {companySettings.logo && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={companySettings.logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain border rounded"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                <Badge variant="secondary" className="text-xs">Logo chargé</Badge>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ce logo apparaîtra dans l'en-tête et sur les documents PDF
          </p>
        </div>
        <div>
          <Label htmlFor="company-favicon">Icône de l'application (Favicon)</Label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                id="company-favicon"
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload('favicon', e)}
              />
            </div>
            {companySettings.favicon && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={companySettings.favicon}
                  alt="Favicon"
                  className="h-8 w-8 object-contain border rounded"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                <Badge variant="secondary" className="text-xs">Icône chargée</Badge>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cette icône apparaîtra dans l'onglet du navigateur
          </p>
        </div>
        <Button onClick={saveCompanySettings} className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </CardContent>
    </Card>
  );
};

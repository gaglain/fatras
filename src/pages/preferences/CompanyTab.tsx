
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const CompanyTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: "Fatras Booking",
    logo: "",
    favicon: ""
  });

  // Charger les paramètres sauvegardés depuis Supabase
  useEffect(() => {
    loadCompanySettings();
  }, [user]);

  const loadCompanySettings = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', ['company_name', 'company_logo', 'company_favicon']);

      if (error) throw error;

      const settings = data?.reduce((acc, item) => {
        switch (item.setting_key) {
          case 'company_name':
            acc.name = item.setting_value;
            break;
          case 'company_logo':
            acc.logo = item.setting_value;
            break;
          case 'company_favicon':
            acc.favicon = item.setting_value;
            break;
        }
        return acc;
      }, { name: "Fatras Booking", logo: "", favicon: "" });

      if (settings) {
        setCompanySettings(settings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const saveCompanySettings = async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour sauvegarder");
      return;
    }

    setLoading(true);
    try {
      const settingsToSave = [
        { setting_key: 'company_name', setting_value: companySettings.name },
        { setting_key: 'company_logo', setting_value: companySettings.logo },
        { setting_key: 'company_favicon', setting_value: companySettings.favicon }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            setting_key: setting.setting_key,
            setting_value: setting.setting_value
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (error) throw error;
      }

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

      // Déclencher l'événement pour les autres composants
      window.dispatchEvent(new CustomEvent('companySettingsChanged', { detail: companySettings }));
      
      toast.success("Paramètres de l'entreprise sauvegardés");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: "logo" | "favicon", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5MB");
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `company/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('app-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('app-assets')
        .getPublicUrl(filePath);

      // Update state immediately
      setCompanySettings(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      // Also save to database immediately
      const { error: dbError } = await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          setting_key: type === "logo" ? 'company_logo' : 'company_favicon',
          setting_value: publicUrl
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (dbError) throw dbError;

      toast.success(`${type === "logo" ? "Logo" : "Icône"} chargé et enregistré avec succès`);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      toast.error("Erreur lors du chargement du fichier");
    } finally {
      setLoading(false);
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Input
                id="company-logo"
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload('logo', e)}
                disabled={loading}
              />
            </div>
            {companySettings.logo && (
              <div className="flex flex-col items-center space-y-2 sm:items-start">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Input
                id="company-favicon"
                type="file"
                accept="image/*"
                onChange={e => handleFileUpload('favicon', e)}
                disabled={loading}
              />
            </div>
            {companySettings.favicon && (
              <div className="flex flex-col items-center space-y-2 sm:items-start">
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
        <Button 
          onClick={saveCompanySettings} 
          className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white"
          disabled={loading}
        >
          {loading ? (
            <Upload className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </Button>
      </CardContent>
    </Card>
  );
};

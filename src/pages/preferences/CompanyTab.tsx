
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Upload, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  CompanySettings, defaultCompanySettings,
  loadCompanySettings, saveCompanySettings,
  uploadFile, uploadPWAIcons
} from './CompanySettingsLogic';

export const CompanyTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPWA, setUploadingPWA] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);

  useEffect(() => {
    if (user?.id) {
      loadCompanySettings(user.id).then(s => { if (s) setSettings(s); });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) { toast.error("Vous devez être connecté"); return; }
    setLoading(true);
    try { await saveCompanySettings(user.id, settings); toast.success("Paramètres sauvegardés"); }
    catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (type: 'logo' | 'favicon' | 'appIcon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setLoading(true);
    try {
      const url = await uploadFile(user.id, type, file);
      const next = { ...settings, [type]: url };
      setSettings(next);
      toast.success('Fichier chargé et enregistré');
    } catch { toast.error("Erreur lors du chargement"); }
    finally { setLoading(false); }
  };

  const handlePWAUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingPWA(true);
    try {
      toast.info("Génération des icônes PWA...");
      const updated = await uploadPWAIcons(user.id, file, settings);
      setSettings(updated);
      toast.success("✅ Icônes PWA générées et installées !");
    } catch { toast.error("Erreur lors de la génération des icônes PWA"); }
    finally { setUploadingPWA(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Globe className="h-5 w-5 mr-2" />Informations de l'entreprise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PWA Icon */}
        <div>
          <Label htmlFor="pwa-icon"><div className="flex items-center gap-2 mb-2"><Smartphone className="h-4 w-4" /><span>Icône PWA pour Mobile</span></div></Label>
          <p className="text-sm text-muted-foreground mb-3">Upload une image carrée (PNG, min 512x512px).</p>
          <Input id="pwa-icon" type="file" accept="image/*" onChange={handlePWAUpload} disabled={uploadingPWA || loading} />
          {uploadingPWA && <div className="flex items-center gap-2 text-sm text-blue-600 mt-2"><div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />Génération en cours...</div>}
          {settings.pwaIcon192 && settings.pwaIcon512 && (
            <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mt-2">
              <div className="flex gap-2">
                <img src={settings.pwaIcon192} alt="192" className="h-12 w-12 object-contain border rounded shadow-sm" />
                <img src={settings.pwaIcon512} alt="512" className="h-12 w-12 object-contain border rounded shadow-sm" />
              </div>
              <div><Badge variant="default" className="bg-green-600 text-xs mb-1">✓ PWA Configuré</Badge><p className="text-xs text-muted-foreground">Icônes installées (192px, 512px + Apple)</p></div>
            </div>
          )}
          {!settings.pwaIcon192 && <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg mt-2"><p className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ Aucune icône PWA configurée.</p></div>}
        </div>

        {/* Company name */}
        <div>
          <Label htmlFor="company-name">Nom de l'entreprise</Label>
          <Input id="company-name" value={settings.name} onChange={e => setSettings(p => ({ ...p, name: e.target.value }))} />
        </div>

        {/* App icon */}
        <div>
          <Label>Icône de l'application PWA (mobile)</Label>
          <p className="text-sm text-muted-foreground mb-2">512x512px recommandé</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Input type="file" accept="image/*" onChange={e => handleFileUpload('appIcon', e)} disabled={loading} className="flex-1" />
            {settings.appIcon && <img src={settings.appIcon} alt="App" className="h-16 w-16 object-contain border rounded-lg shadow-sm" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
          </div>
        </div>

        {/* Logo */}
        <div>
          <Label>Logo de l'entreprise (desktop)</Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Input type="file" accept="image/*" onChange={e => handleFileUpload('logo', e)} disabled={loading} className="flex-1" />
            {settings.logo && <div className="flex flex-col items-center space-y-2"><img src={settings.logo} alt="Logo" className="h-12 w-12 object-contain border rounded" onError={e => { e.currentTarget.style.display = 'none'; }} /><Badge variant="secondary" className="text-xs">Logo chargé</Badge></div>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Apparaîtra dans l'en-tête et les PDF</p>
        </div>

        {/* Favicon */}
        <div>
          <Label>Icône de l'application (Favicon)</Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Input type="file" accept="image/*" onChange={e => handleFileUpload('favicon', e)} disabled={loading} className="flex-1" />
            {settings.favicon && <div className="flex flex-col items-center space-y-2"><img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain border rounded" onError={e => { e.currentTarget.style.display = 'none'; }} /><Badge variant="secondary" className="text-xs">Icône chargée</Badge></div>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Apparaîtra dans l'onglet du navigateur</p>
        </div>

        <Button onClick={handleSave} className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white" disabled={loading}>
          {loading ? <Upload className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Sauvegarder
        </Button>
      </CardContent>
    </Card>
  );
};

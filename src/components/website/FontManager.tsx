import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Upload, Type } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FontConfig {
  id: string;
  name: string;
  type: 'google' | 'custom';
  url?: string;
  family: string;
  weights?: string[];
}

// Liste de Google Fonts populaires
const popularGoogleFonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Source Sans Pro',
  'Raleway',
  'Poppins',
  'Merriweather',
  'Nunito',
  'Playfair Display',
  'Ubuntu',
  'PT Sans',
  'Noto Sans',
  'Mukta'
];

export const FontManager: React.FC = () => {
  const [fonts, setFonts] = useState<FontConfig[]>([]);
  const [selectedGoogleFont, setSelectedGoogleFont] = useState('');
  const [customFontName, setCustomFontName] = useState('');
  const [customFontUrl, setCustomFontUrl] = useState('');
  const [customFontFile, setCustomFontFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'website_fonts')
        .maybeSingle();

      if (settings?.setting_value) {
        const parsedFonts = JSON.parse(settings.setting_value as string);
        setFonts(parsedFonts);
        applyFonts(parsedFonts);
      }
    } catch {
      // Silent - fonts loading failed
    }
  };

  const applyFonts = (fontsConfig: FontConfig[]) => {
    // Supprimer les anciennes fonts
    const existingLinks = document.querySelectorAll('link[data-font-manager]');
    existingLinks.forEach(link => link.remove());

    const existingStyles = document.querySelectorAll('style[data-font-manager]');
    existingStyles.forEach(style => style.remove());

    // Ajouter les nouvelles fonts
    fontsConfig.forEach(font => {
      if (font.type === 'google') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(' ', '+')}:wght@${font.weights?.join(';') || '400;700'}&display=swap`;
        link.setAttribute('data-font-manager', 'true');
        document.head.appendChild(link);
      } else if (font.type === 'custom' && font.url) {
        const style = document.createElement('style');
        style.setAttribute('data-font-manager', 'true');
        style.textContent = `
          @font-face {
            font-family: '${font.family}';
            src: url('${font.url}');
          }
        `;
        document.head.appendChild(style);
      }
    });
  };

  const saveFonts = async (newFonts: FontConfig[]) => {
    try {
      setLoading(true);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          user_id: user.id,
          setting_key: 'website_fonts',
          setting_value: JSON.stringify(newFonts)
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) throw error;

      setFonts(newFonts);
      applyFonts(newFonts);
      toast.success('Fonts enregistrées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const addGoogleFont = async () => {
    if (!selectedGoogleFont) return;

    const newFont: FontConfig = {
      id: crypto.randomUUID(),
      name: selectedGoogleFont,
      type: 'google',
      family: selectedGoogleFont,
      weights: ['400', '700']
    };

    await saveFonts([...fonts, newFont]);
    setSelectedGoogleFont('');
  };

  const uploadCustomFont = async () => {
    if (!customFontFile || !customFontName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);

      // Upload du fichier
      const fileName = `${Date.now()}_${customFontFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('website-images')
        .upload(`fonts/${fileName}`, customFontFile);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(`fonts/${fileName}`);

      const newFont: FontConfig = {
        id: crypto.randomUUID(),
        name: customFontName,
        type: 'custom',
        family: customFontName,
        url: publicUrl
      };

      await saveFonts([...fonts, newFont]);
      setCustomFontName('');
      setCustomFontFile(null);
      setCustomFontUrl('');
      toast.success('Font personnalisée ajoutée');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const addCustomFontUrl = async () => {
    if (!customFontUrl || !customFontName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const newFont: FontConfig = {
      id: crypto.randomUUID(),
      name: customFontName,
      type: 'custom',
      family: customFontName,
      url: customFontUrl
    };

    await saveFonts([...fonts, newFont]);
    setCustomFontName('');
    setCustomFontUrl('');
  };

  const removeFont = async (fontId: string) => {
    const newFonts = fonts.filter(f => f.id !== fontId);
    await saveFonts(newFonts);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Google Fonts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedGoogleFont} onValueChange={setSelectedGoogleFont}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choisir une Google Font..." />
              </SelectTrigger>
              <SelectContent>
                {popularGoogleFonts.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addGoogleFont} disabled={!selectedGoogleFont || loading}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Font personnalisée (fichier)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-font-name">Nom de la font</Label>
            <Input
              id="custom-font-name"
              value={customFontName}
              onChange={(e) => setCustomFontName(e.target.value)}
              placeholder="Ma Font Personnalisée"
            />
          </div>
          <div>
            <Label htmlFor="custom-font-file">Fichier font (.woff, .woff2, .ttf)</Label>
            <Input
              id="custom-font-file"
              type="file"
              accept=".woff,.woff2,.ttf,.otf"
              onChange={(e) => setCustomFontFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={uploadCustomFont} disabled={!customFontFile || !customFontName || loading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload et ajouter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Font personnalisée (URL)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-url-name">Nom de la font</Label>
            <Input
              id="custom-url-name"
              value={customFontName}
              onChange={(e) => setCustomFontName(e.target.value)}
              placeholder="Ma Font"
            />
          </div>
          <div>
            <Label htmlFor="custom-font-url">URL de la font</Label>
            <Input
              id="custom-font-url"
              value={customFontUrl}
              onChange={(e) => setCustomFontUrl(e.target.value)}
              placeholder="https://example.com/font.woff2"
            />
          </div>
          <Button onClick={addCustomFontUrl} disabled={!customFontUrl || !customFontName || loading}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fonts installées</CardTitle>
        </CardHeader>
        <CardContent>
          {fonts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune font installée</p>
          ) : (
            <div className="space-y-2">
              {fonts.map(font => (
                <div key={font.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium" style={{ fontFamily: font.family }}>
                      {font.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {font.type === 'google' ? 'Google Font' : 'Font personnalisée'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFont(font.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

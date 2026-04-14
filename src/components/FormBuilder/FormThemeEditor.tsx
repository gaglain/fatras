import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormTheme, FormFont, FONT_OPTIONS } from './types';
import { Palette, Image, Type, Upload, Maximize, X, Folder } from 'lucide-react';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface FormThemeEditorProps {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
}

const THEME_PRESETS = [
  {
    id: 'fatras',
    label: 'Fatras',
    colors: { backgroundColor: 'hsl(35, 30%, 97%)', textColor: 'hsl(25, 20%, 15%)', buttonColor: 'hsl(16, 65%, 45%)', buttonTextColor: 'hsl(40, 30%, 98%)' },
  },
  {
    id: 'dark',
    label: 'Sombre',
    colors: { backgroundColor: 'hsl(25, 20%, 12%)', textColor: 'hsl(40, 30%, 95%)', buttonColor: 'hsl(42, 75%, 55%)', buttonTextColor: 'hsl(25, 20%, 12%)' },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    colors: { backgroundColor: '#ffffff', textColor: '#1a1a1a', buttonColor: '#1a1a1a', buttonTextColor: '#ffffff' },
  },
  {
    id: 'ocean',
    label: 'Océan',
    colors: { backgroundColor: '#f0f9ff', textColor: '#0c2340', buttonColor: '#2d8a9e', buttonTextColor: '#ffffff' },
  },
  {
    id: 'custom',
    label: 'Personnalisé',
    colors: null,
  },
];

export const FormThemeEditor: React.FC<FormThemeEditorProps> = ({ theme, onChange }) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [activePreset, setActivePreset] = useState<string>(() => {
    // Detect active preset from current colors
    for (const preset of THEME_PRESETS) {
      if (preset.colors && 
          theme.backgroundColor === preset.colors.backgroundColor &&
          theme.textColor === preset.colors.textColor &&
          theme.buttonColor === preset.colors.buttonColor) {
        return preset.id;
      }
    }
    return theme.backgroundColor || theme.textColor ? 'custom' : 'fatras';
  });

  const update = (key: keyof FormTheme, value: any) => {
    onChange({ ...theme, [key]: value });
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset?.colors) {
      onChange({ ...theme, ...preset.colors });
    }
  };

  const handleImageUpload = async (file: File, field: 'logoUrl' | 'backgroundImage') => {
    try {
      const url = await uploadFile(file, 'publication-media', `form-themes/${Date.now()}-${file.name}`);
      if (url) {
        update(field, url);
        toast.success('Image chargée');
      }
    } catch {
      toast.error("Erreur lors du chargement de l'image");
    }
  };

  const handleFileInput = (field: 'logoUrl' | 'backgroundImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageUpload(file, field);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Palette className="h-4 w-4" />
        Branding & Thème
      </div>

      {/* Theme Presets */}
      <div>
        <Label className="text-xs mb-1.5 block">Thème de couleurs</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`flex items-center gap-2 p-2 rounded-md border text-xs transition-all ${
                activePreset === preset.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {preset.colors ? (
                <div className="flex gap-0.5 shrink-0">
                  {Object.values(preset.colors).map((color, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              ) : (
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="truncate">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors - only show if custom preset */}
      {activePreset === 'custom' && (
        <div className="grid grid-cols-2 gap-2 p-2 rounded-md border border-border bg-muted/30">
          {([
            { key: 'backgroundColor', label: 'Fond', default: '#ffffff' },
            { key: 'textColor', label: 'Texte', default: '#000000' },
            { key: 'buttonColor', label: 'Bouton', default: '#3b82f6' },
            { key: 'buttonTextColor', label: 'Texte bouton', default: '#ffffff' },
          ] as const).map(({ key, label, default: def }) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <div className="flex gap-1 items-center">
                <input
                  type="color"
                  value={theme[key] || def}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer"
                />
                <Input
                  value={theme[key] || ''}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={def}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Font */}
      <div>
        <Label className="text-xs flex items-center gap-1">
          <Type className="h-3 w-3" /> Police
        </Label>
        <Select
          value={theme.font || 'outfit'}
          onValueChange={(value: FormFont) => update('font', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(f => (
              <SelectItem key={f.value} value={f.value} className="text-xs">
                <span style={{ fontFamily: f.family }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Border radius */}
      <div>
        <Label className="text-xs">Arrondi</Label>
        <Select
          value={theme.borderRadius || 'md'}
          onValueChange={(value) => update('borderRadius', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun</SelectItem>
            <SelectItem value="sm">Léger</SelectItem>
            <SelectItem value="md">Moyen</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="full">Pill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logo */}
      <div>
        <Label className="text-xs flex items-center gap-1 mb-1.5">
          <Upload className="h-3 w-3" /> Logo
        </Label>
        {theme.logoUrl ? (
          <div className="relative group rounded-md border border-border overflow-hidden bg-muted/20 p-2">
            <img src={theme.logoUrl} alt="Logo" className="max-h-16 mx-auto object-contain" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => update('logoUrl', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => handleFileInput('logoUrl')}
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Charger
            </Button>
            <ImageGalleryPicker
              onSelect={(url) => update('logoUrl', url)}
              buttonText="Bibliothèque"
              acceptedTypes={['image']}
            />
          </div>
        )}
      </div>

      {/* Background image */}
      <div>
        <Label className="text-xs flex items-center gap-1 mb-1.5">
          <Image className="h-3 w-3" /> Image de fond
        </Label>
        {theme.backgroundImage ? (
          <div className="relative group rounded-md border border-border overflow-hidden">
            <img src={theme.backgroundImage} alt="Fond" className="w-full h-20 object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => update('backgroundImage', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => handleFileInput('backgroundImage')}
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Charger
            </Button>
            <ImageGalleryPicker
              onSelect={(url) => update('backgroundImage', url)}
              buttonText="Bibliothèque"
              acceptedTypes={['image']}
            />
          </div>
        )}
      </div>

      {/* Fullscreen */}
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1">
          <Maximize className="h-3 w-3" /> Mode plein écran
        </Label>
        <Switch
          checked={theme.fullscreen || false}
          onCheckedChange={(checked) => update('fullscreen', checked)}
        />
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => {
          onChange({});
          setActivePreset('fatras');
        }}
      >
        Réinitialiser le thème
      </Button>
    </div>
  );
};

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormTheme, FormFont, FONT_OPTIONS } from './types';
import { Palette, Image, Type, Upload, Maximize } from 'lucide-react';

interface FormThemeEditorProps {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
}

export const FormThemeEditor: React.FC<FormThemeEditorProps> = ({ theme, onChange }) => {
  const update = (key: keyof FormTheme, value: any) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Palette className="h-4 w-4" />
        Branding & Thème
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Fond</Label>
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={theme.backgroundColor || '#ffffff'}
              onChange={(e) => update('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
              value={theme.backgroundColor || ''}
              onChange={(e) => update('backgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Texte</Label>
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={theme.textColor || '#000000'}
              onChange={(e) => update('textColor', e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
              value={theme.textColor || ''}
              onChange={(e) => update('textColor', e.target.value)}
              placeholder="#000000"
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Bouton</Label>
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={theme.buttonColor || '#3b82f6'}
              onChange={(e) => update('buttonColor', e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
              value={theme.buttonColor || ''}
              onChange={(e) => update('buttonColor', e.target.value)}
              placeholder="#3b82f6"
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Texte bouton</Label>
          <div className="flex gap-1 items-center">
            <input
              type="color"
              value={theme.buttonTextColor || '#ffffff'}
              onChange={(e) => update('buttonTextColor', e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
              value={theme.buttonTextColor || ''}
              onChange={(e) => update('buttonTextColor', e.target.value)}
              placeholder="#ffffff"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

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

      {/* Logo URL */}
      <div>
        <Label className="text-xs flex items-center gap-1">
          <Upload className="h-3 w-3" /> URL du logo
        </Label>
        <Input
          value={theme.logoUrl || ''}
          onChange={(e) => update('logoUrl', e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>

      {/* Background image */}
      <div>
        <Label className="text-xs flex items-center gap-1">
          <Image className="h-3 w-3" /> Image de fond
        </Label>
        <Input
          value={theme.backgroundImage || ''}
          onChange={(e) => update('backgroundImage', e.target.value)}
          placeholder="https://..."
          className="h-8 text-xs"
        />
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
        onClick={() => onChange({})}
      >
        Réinitialiser le thème
      </Button>
    </div>
  );
};

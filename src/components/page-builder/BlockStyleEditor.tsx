import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockStyle } from './types';

interface BlockStyleEditorProps {
  style: BlockStyle;
  onChange: (style: BlockStyle) => void;
}

export const BlockStyleEditor: React.FC<BlockStyleEditorProps> = ({ style, onChange }) => {
  const updateStyle = (key: keyof BlockStyle, value: string) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border-t">
      <h4 className="font-medium text-sm">Style du bloc</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Couleur de fond</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="w-10 h-8 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={style.backgroundColor || ''}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              placeholder="transparent"
              className="h-8 text-xs"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Couleur du texte</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={style.textColor || '#000000'}
              onChange={(e) => updateStyle('textColor', e.target.value)}
              className="w-10 h-8 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={style.textColor || ''}
              onChange={(e) => updateStyle('textColor', e.target.value)}
              placeholder="inherit"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Padding</Label>
          <Select 
            value={style.padding || 'md'} 
            onValueChange={(v) => updateStyle('padding', v as BlockStyle['padding'])}
          >
            <SelectTrigger className="h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="md">Moyen</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
              <SelectItem value="xl">Très grand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Marge</Label>
          <Select 
            value={style.margin || 'none'} 
            onValueChange={(v) => updateStyle('margin', v as BlockStyle['margin'])}
          >
            <SelectTrigger className="h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              <SelectItem value="sm">Petite</SelectItem>
              <SelectItem value="md">Moyenne</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
              <SelectItem value="xl">Très grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Alignement texte</Label>
          <Select 
            value={style.textAlign || 'left'} 
            onValueChange={(v) => updateStyle('textAlign', v as BlockStyle['textAlign'])}
          >
            <SelectTrigger className="h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Gauche</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Droite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Taille police</Label>
          <Select 
            value={style.fontSize || 'base'} 
            onValueChange={(v) => updateStyle('fontSize', v as BlockStyle['fontSize'])}
          >
            <SelectTrigger className="h-8 text-xs mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
              <SelectItem value="xl">Très grand</SelectItem>
              <SelectItem value="2xl">Extra grand</SelectItem>
              <SelectItem value="3xl">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Graisse police</Label>
        <Select 
          value={style.fontWeight || 'normal'} 
          onValueChange={(v) => updateStyle('fontWeight', v as BlockStyle['fontWeight'])}
        >
          <SelectTrigger className="h-8 text-xs mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="semibold">Semi-bold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

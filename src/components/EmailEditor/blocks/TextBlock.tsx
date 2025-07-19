
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Type, Settings } from 'lucide-react';
import { TextBlockContent } from '../types';

interface TextBlockProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, onChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Configuration du texte
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            Fermer
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="text">Contenu</Label>
            <textarea
              id="text"
              value={content.text}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              className="w-full min-h-[100px] p-2 border rounded resize-none"
              placeholder="Votre texte ici..."
            />
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="fontSize">Taille (px)</Label>
              <Input
                id="fontSize"
                type="number"
                value={content.fontSize}
                onChange={(e) => onChange({ ...content, fontSize: parseInt(e.target.value) || 14 })}
                min="8"
                max="48"
              />
            </div>
            <div>
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="color"
                value={content.color}
                onChange={(e) => onChange({ ...content, color: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="alignment">Alignement</Label>
              <Select
                value={content.alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, alignment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bold"
                  checked={content.bold}
                  onCheckedChange={(checked) => onChange({ ...content, bold: checked })}
                />
                <Label htmlFor="bold">Gras</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="italic"
                  checked={content.italic}
                  onCheckedChange={(checked) => onChange({ ...content, italic: checked })}
                />
                <Label htmlFor="italic">Italique</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <div
        style={{
          fontSize: `${content.fontSize}px`,
          color: content.color,
          textAlign: content.alignment,
          fontWeight: content.bold ? 'bold' : 'normal',
          fontStyle: content.italic ? 'italic' : 'normal',
          whiteSpace: 'pre-wrap',
          minHeight: '24px',
          cursor: 'pointer'
        }}
        onClick={() => setShowSettings(true)}
        className="p-2 hover:bg-muted/20 rounded transition-colors"
      >
        {content.text || 'Cliquez pour éditer le texte...'}
      </div>
    </div>
  );
};

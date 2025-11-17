
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Heading1, Settings } from 'lucide-react';
import { HeadingBlockContent } from '../types';

interface HeadingBlockProps {
  content: HeadingBlockContent;
  onChange: (content: HeadingBlockContent) => void;
  isSelected?: boolean;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ content, onChange, isSelected = false }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Sync settings panel with current selection
  useEffect(() => {
    setShowSettings(isSelected);
  }, [isSelected]);
  
  const shouldShowSettings = isSelected && showSettings;
  
  const getHeadingSize = (level: number) => {
    switch (level) {
      case 1: return '32px';
      case 2: return '24px';
      case 3: return '20px';
      default: return '24px';
    }
  };

  const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;

  if (shouldShowSettings) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Heading1 className="h-4 w-4" />
            Configuration du titre
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
            <Label htmlFor="heading-text">Titre</Label>
            <Input
              id="heading-text"
              value={content.text}
              onChange={(e) => onChange({ ...content, text: e.target.value })}
              placeholder="Votre titre ici"
            />
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={content.level.toString()}
                onValueChange={(value) => onChange({ ...content, level: parseInt(value) as 1 | 2 | 3 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 - Principal</SelectItem>
                  <SelectItem value="2">H2 - Secondaire</SelectItem>
                  <SelectItem value="3">H3 - Tertiaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="heading-color">Couleur</Label>
              <Input
                id="heading-color"
                type="color"
                value={content.color}
                onChange={(e) => onChange({ ...content, color: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="heading-alignment">Alignement</Label>
              <Select
                value={content.align}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, align: value })
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
      <HeadingTag
        style={{
          fontSize: typeof content.level === 'number' ? getHeadingSize(content.level) : getHeadingSize(parseInt(content.level.replace('h', ''))),
          color: content.color,
          textAlign: content.align,
          fontWeight: 'bold',
          margin: 0,
          lineHeight: 1.2,
          cursor: 'pointer'
        }}
        onClick={() => setShowSettings(true)}
        className="p-2 hover:bg-muted/20 rounded transition-colors"
      >
        {content.text || 'Cliquez pour éditer le titre...'}
      </HeadingTag>
    </div>
  );
};

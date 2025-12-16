import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface HeroEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Titre</Label>
        <Input
          value={content.title || ''}
          onChange={(e) => update('title', e.target.value)}
        />
      </div>
      <div>
        <Label>Sous-titre</Label>
        <Input
          value={content.subtitle || ''}
          onChange={(e) => update('subtitle', e.target.value)}
        />
      </div>
      <div>
        <Label>Image de fond (URL)</Label>
        <Input
          value={content.backgroundImage || ''}
          onChange={(e) => update('backgroundImage', e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Overlay sombre</Label>
        <Switch
          checked={content.overlay !== false}
          onCheckedChange={(checked) => update('overlay', checked)}
        />
      </div>
      {content.overlay !== false && (
        <div>
          <Label>Opacité overlay ({content.overlayOpacity || 50}%)</Label>
          <Slider
            value={[content.overlayOpacity || 50]}
            onValueChange={([v]) => update('overlayOpacity', v)}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Texte du bouton</Label>
          <Input
            value={content.buttonText || ''}
            onChange={(e) => update('buttonText', e.target.value)}
          />
        </div>
        <div>
          <Label>Lien du bouton</Label>
          <Input
            value={content.buttonLink || ''}
            onChange={(e) => update('buttonLink', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

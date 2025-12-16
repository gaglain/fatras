import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CtaEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const CtaEditor: React.FC<CtaEditorProps> = ({ content, onChange }) => {
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

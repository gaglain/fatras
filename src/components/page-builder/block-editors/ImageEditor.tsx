import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>URL de l'image</Label>
        <Input
          value={content.src || ''}
          onChange={(e) => update('src', e.target.value)}
        />
      </div>
      <div>
        <Label>Texte alternatif</Label>
        <Input
          value={content.alt || ''}
          onChange={(e) => update('alt', e.target.value)}
        />
      </div>
      <div>
        <Label>Taille</Label>
        <Select value={content.size || 'md'} onValueChange={(v) => update('size', v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Petit</SelectItem>
            <SelectItem value="md">Moyen</SelectItem>
            <SelectItem value="lg">Grand</SelectItem>
            <SelectItem value="full">Pleine largeur</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

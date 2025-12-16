import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface GalleryEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  const updateImage = (index: number, value: string) => {
    const images = [...(content.images || [])];
    images[index] = value;
    update('images', images);
  };

  const addImage = () => {
    const images = [...(content.images || [])];
    images.push('/placeholder.svg');
    update('images', images);
  };

  const removeImage = (index: number) => {
    const images = [...(content.images || [])];
    images.splice(index, 1);
    update('images', images);
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
        <Label>Colonnes</Label>
        <Select 
          value={String(content.columns || 3)} 
          onValueChange={(v) => update('columns', parseInt(v))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 colonnes</SelectItem>
            <SelectItem value="3">3 colonnes</SelectItem>
            <SelectItem value="4">4 colonnes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <Button size="sm" variant="outline" onClick={addImage}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        {(content.images || []).map((image: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="URL de l'image"
              value={image}
              onChange={(e) => updateImage(index, e.target.value)}
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => removeImage(index)}
              className="px-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

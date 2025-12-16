import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface TestimonialsEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  const updateItem = (index: number, key: string, value: string) => {
    const items = [...(content.items || [])];
    items[index] = { ...items[index], [key]: value };
    update('items', items);
  };

  const addItem = () => {
    const items = [...(content.items || [])];
    items.push({ name: '', role: '', content: '', avatar: '' });
    update('items', items);
  };

  const removeItem = (index: number) => {
    const items = [...(content.items || [])];
    items.splice(index, 1);
    update('items', items);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Titre de la section</Label>
        <Input
          value={content.title || ''}
          onChange={(e) => update('title', e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Témoignages</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        {(content.items || []).map((item: any, index: number) => (
          <div key={index} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Témoignage {index + 1}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeItem(index)}
                className="h-7 w-7 p-0 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nom"
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Fonction/Rôle"
                value={item.role || ''}
                onChange={(e) => updateItem(index, 'role', e.target.value)}
              />
            </div>
            <Input
              placeholder="URL Avatar"
              value={item.avatar || ''}
              onChange={(e) => updateItem(index, 'avatar', e.target.value)}
            />
            <Textarea
              placeholder="Témoignage"
              value={item.content || ''}
              onChange={(e) => updateItem(index, 'content', e.target.value)}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

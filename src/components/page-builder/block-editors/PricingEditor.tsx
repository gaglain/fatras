import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';

interface PricingEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const PricingEditor: React.FC<PricingEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  const updateItem = (index: number, key: string, value: any) => {
    const items = [...(content.items || [])];
    items[index] = { ...items[index], [key]: value };
    update('items', items);
  };

  const addItem = () => {
    const items = [...(content.items || [])];
    items.push({ name: '', price: '', features: [], highlighted: false });
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
          <Label>Plans tarifaires</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        {(content.items || []).map((item: any, index: number) => (
          <div key={index} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan {index + 1}</span>
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
                placeholder="Nom du plan"
                value={item.name || ''}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Prix"
                value={item.price || ''}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Fonctionnalités (une par ligne)"
              value={(item.features || []).join('\n')}
              onChange={(e) => updateItem(index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={item.highlighted || false}
                onCheckedChange={(checked) => updateItem(index, 'highlighted', checked)}
              />
              <Label className="text-sm">Mettre en avant</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface CounterEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const CounterEditor: React.FC<CounterEditorProps> = ({ content, onChange }) => {
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
    items.push({ value: '0', label: '' });
    update('items', items);
  };

  const removeItem = (index: number) => {
    const items = [...(content.items || [])];
    items.splice(index, 1);
    update('items', items);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Compteurs</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        {(content.items || []).map((item: any, index: number) => (
          <div key={index} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compteur {index + 1}</span>
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
                placeholder="Valeur (ex: 100+)"
                value={item.value || ''}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
              />
              <Input
                placeholder="Label"
                value={item.label || ''}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface ColumnsEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const ColumnsEditor: React.FC<ColumnsEditorProps> = ({ content, onChange }) => {
  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  const updateItem = (index: number, key: string, value: string) => {
    const items = [...(content.items || [])];
    items[index] = { ...items[index], [key]: value };
    update('items', items);
  };

  const addColumn = () => {
    const items = [...(content.items || [])];
    items.push({ title: `Colonne ${items.length + 1}`, content: '' });
    update('items', items);
  };

  const removeColumn = (index: number) => {
    const items = [...(content.items || [])];
    items.splice(index, 1);
    update('items', items);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre de colonnes</Label>
          <Select 
            value={String(content.columns || 2)} 
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
        <div>
          <Label>Espacement</Label>
          <Select value={content.gap || 'md'} onValueChange={(v) => update('gap', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="md">Moyen</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Contenu des colonnes</Label>
          <Button size="sm" variant="outline" onClick={addColumn}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter
          </Button>
        </div>
        {(content.items || []).map((item: any, index: number) => (
          <div key={index} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Colonne {index + 1}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeColumn(index)}
                className="h-7 w-7 p-0 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input
              placeholder="Titre"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
            />
            <Textarea
              placeholder="Contenu"
              value={item.content || ''}
              onChange={(e) => updateItem(index, 'content', e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

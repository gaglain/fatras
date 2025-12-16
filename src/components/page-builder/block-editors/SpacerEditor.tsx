import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpacerEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const SpacerEditor: React.FC<SpacerEditorProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Hauteur</Label>
        <Select 
          value={content.height || 'md'} 
          onValueChange={(v) => onChange({ ...content, height: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Petit (20px)</SelectItem>
            <SelectItem value="md">Moyen (40px)</SelectItem>
            <SelectItem value="lg">Grand (80px)</SelectItem>
            <SelectItem value="xl">Très grand (120px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Contenu</Label>
        <Textarea
          value={content.content || ''}
          onChange={(e) => onChange({ ...content, content: e.target.value })}
          rows={6}
          className="mt-1"
        />
      </div>
    </div>
  );
};

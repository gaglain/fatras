import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TextBlockContent } from '../types';
import { sanitizeHtml } from '@/lib/sanitize';

interface TextBlockProps {
  content: TextBlockContent;
  isEditing: boolean;
  onChange: (content: TextBlockContent) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, isEditing, onChange }) => {
  const [isEditingText, setIsEditingText] = useState(false);

  if (isEditing && isEditingText) {
    return (
      <Card className="m-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <Textarea
              value={content.content.replace(/<[^>]*>/g, '')}
              onChange={(e) => onChange({ ...content, content: `<p>${e.target.value}</p>` })}
              placeholder="Saisissez votre texte..."
              className="min-h-[100px]"
            />
            
            <div className="flex items-center space-x-4">
              <Select
                value={content.alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, alignment: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={content.fontSize || 'base'}
                onValueChange={(value) => onChange({ ...content, fontSize: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Petit</SelectItem>
                  <SelectItem value="base">Normal</SelectItem>
                  <SelectItem value="lg">Grand</SelectItem>
                  <SelectItem value="xl">Très grand</SelectItem>
                  <SelectItem value="2xl">Énorme</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setIsEditingText(false)}>
                Terminer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTextSizeClass = (size?: string) => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      case '3xl': return 'text-3xl';
      default: return 'text-base';
    }
  };

  return (
    <div className={`px-4 py-6 ${isEditing ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
      <div
        className={`${getTextSizeClass(content.fontSize)} text-${content.alignment}`}
        onClick={() => isEditing && setIsEditingText(true)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.content) }}
      />
    </div>
  );
};

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { FormField } from './types';

export const LiveFieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  const inputClass = 'w-full pointer-events-none';

  if (field.type === 'heading') {
    return <h3 className="text-xl font-semibold text-foreground">{field.label}</h3>;
  }

  if (field.type === 'paragraph') {
    return <p className="text-sm leading-relaxed text-muted-foreground">{field.description || 'Texte de paragraphe...'}</p>;
  }

  if (field.type === 'rating') {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="text-2xl text-muted-foreground/40 select-none">★</span>
        ))}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <Select disabled>
        <SelectTrigger className={inputClass}>
          <SelectValue placeholder={field.placeholder || 'Sélectionnez...'} />
        </SelectTrigger>
      </Select>
    );
  }

  if (field.type === 'radio' && field.options?.length) {
    return (
      <div className="space-y-2 pointer-events-none">
        {field.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border border-border" />
            <span className="text-sm">{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'checkbox' && field.options?.length) {
    return (
      <div className="space-y-2 pointer-events-none">
        {field.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm border border-border" />
            <span className="text-sm">{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return <Textarea placeholder={field.placeholder || 'Votre réponse...'} rows={3} disabled className={inputClass} />;
  }

  if (field.type === 'file') {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-center pointer-events-none">
        <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
        <p className="text-xs text-muted-foreground">Cliquez ou glissez un fichier</p>
      </div>
    );
  }

  return (
    <Input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
      placeholder={field.placeholder || 'Votre réponse...'}
      disabled
      className={inputClass}
    />
  );
};

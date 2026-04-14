
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from './types';

interface SteppedFieldRendererProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  onAutoAdvance: () => void;
}

export const SteppedFieldRenderer: React.FC<SteppedFieldRendererProps> = ({
  field, value, onChange, onAutoAdvance
}) => {
  const commonClass = "text-lg border-0 border-b-2 border-muted rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors";

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
      return (
        <Input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || 'Tapez votre réponse ici...'}
          required={field.required}
          min={field.min}
          max={field.max}
          maxLength={field.maxLength}
          className={commonClass}
          autoFocus
        />
      );

    case 'date':
      return (
        <Input type="date" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClass} autoFocus />
      );

    case 'time':
      return (
        <Input type="time" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClass} autoFocus />
      );

    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder || 'Tapez votre réponse ici...'}
          required={field.required}
          maxLength={field.maxLength}
          rows={3}
          className="text-lg border-0 border-b-2 border-muted rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary resize-none transition-colors"
          autoFocus
        />
      );

    case 'select':
    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(field.id, option);
                setTimeout(() => onAutoAdvance(), 400);
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-base",
                "hover:border-primary hover:bg-primary/5",
                value === option
                  ? "border-primary bg-primary/10 text-foreground font-medium"
                  : "border-border text-muted-foreground"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 border text-xs font-medium mr-3 bg-muted",
                field.type === 'radio' ? 'rounded-full' : 'rounded'
              )}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => {
            const isChecked = (value || []).includes(option);
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const currentValues = value || [];
                  if (isChecked) {
                    onChange(field.id, currentValues.filter((v: string) => v !== option));
                  } else {
                    onChange(field.id, [...currentValues, option]);
                  }
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-base flex items-center",
                  "hover:border-primary hover:bg-primary/5",
                  isChecked
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground"
                )}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded border text-xs mr-3 transition-colors",
                  isChecked ? "bg-primary border-primary text-primary-foreground" : "bg-muted"
                )}>
                  {isChecked && <Check className="h-4 w-4" />}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      );

    case 'rating':
      return (
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                onChange(field.id, star);
                setTimeout(() => onAutoAdvance(), 400);
              }}
              className={cn(
                "text-4xl transition-all duration-200 hover:scale-110",
                value >= star ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'
              )}
            >
              ★
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
};

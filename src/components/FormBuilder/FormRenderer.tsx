import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormSubmission } from './types';
import { FormRendererStepped } from './FormRendererStepped';
import { FormThemeWrapper } from './FormThemeWrapper';
import { evaluateFieldVisibility } from './conditionalLogic';

interface FormRendererProps {
  form: FormData;
  onSubmit?: (submission: FormSubmission) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Delegate to stepped renderer if display mode is "stepped"
  if (form.settings.displayMode === 'stepped') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <FormRendererStepped form={form} onSubmit={onSubmit} />
      </div>
    );
  }

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Fake success to not alert the bot
      toast.success(form.settings.successMessage);
      return;
    }
    
    setIsSubmitting(true);

    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Call edge function to handle submission, contact creation, and notification
      const { data: response, error } = await supabase.functions.invoke('form-submission-handler', {
        body: {
          formId: form.id,
          data: formData,
          honeypot: honeypot, // Send honeypot for server-side check too
        }
      });

      if (error) {
        throw error;
      }

      const submission: FormSubmission = {
        id: response?.submissionId || `submission_${Date.now()}`,
        formId: form.id,
        data: formData,
        submittedAt: new Date().toISOString()
      };

      onSubmit?.(submission);
      toast.success(form.settings.successMessage);
      setFormData({});
      
      // Redirect if configured
      if (form.settings.redirectUrl) {
        window.location.href = form.settings.redirectUrl;
      }
    } catch {
      toast.error('Erreur lors de l\'envoi du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            maxLength={field.maxLength}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => updateFieldValue(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}_${index}`}
                  checked={(formData[field.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[field.id] || [];
                    if (checked) {
                      updateFieldValue(field.id, [...currentValues, option]);
                    } else {
                      updateFieldValue(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={formData[field.id] || ''}
            onValueChange={(value) => updateFieldValue(field.id, value)}
          >
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateFieldValue(field.id, star)}
                className={`text-2xl ${formData[field.id] >= star ? 'text-yellow-400' : 'text-muted-foreground'}`}
              >
                ★
              </button>
            ))}
          </div>
        );

      case 'heading':
        return <h3 className="text-lg font-semibold">{field.label}</h3>;

      case 'paragraph':
        return <p className="text-muted-foreground">{field.placeholder}</p>;

      default:
        return null;
    }
  };

  const theme = form.settings.formTheme;
  const buttonStyle: React.CSSProperties = theme?.buttonColor ? {
    backgroundColor: theme.buttonColor,
    color: theme.buttonTextColor || '#ffffff',
    borderColor: theme.buttonColor,
  } : {};

  return (
    <FormThemeWrapper theme={theme}>
      <Card className="max-w-2xl mx-auto" style={theme?.backgroundImage ? { background: 'transparent', border: 'none' } : undefined}>
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          {form.description && (
            <p className="text-sm text-muted-foreground">{form.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from humans, visible to bots */}
            <div 
              className="absolute left-[-9999px]" 
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px' }}
            >
              <Input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {form.fields.map((field) => {
              // Evaluate conditional visibility
              const isVisible = evaluateFieldVisibility(field, formData, form.fields);
              if (!isVisible) return null;

              return (
                <div 
                  key={field.id} 
                  className={`space-y-2 ${field.width === 'half' ? 'w-1/2 inline-block pr-2' : 'w-full'}`}
                >
                  {field.type !== 'heading' && field.type !== 'paragraph' && (
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              );
            })}
            
            <Button type="submit" disabled={isSubmitting} className="w-full" style={buttonStyle}>
              {isSubmitting ? 'Envoi en cours...' : form.settings.submitButtonText}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FormThemeWrapper>
  );
};

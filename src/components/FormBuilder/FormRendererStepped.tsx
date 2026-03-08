import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormField, FormSubmission } from './types';
import { ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormThemeWrapper } from './FormThemeWrapper';
import { evaluateFieldVisibility } from './conditionalLogic';

interface FormRendererSteppedProps {
  form: FormData;
  onSubmit?: (submission: FormSubmission) => void;
}

export const FormRendererStepped: React.FC<FormRendererSteppedProps> = ({ form, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [honeypot, setHoneypot] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter fields: exclude headings/paragraphs AND conditionally hidden fields
  const visibleInputFields = useMemo(() => {
    return form.fields.filter(f => 
      !['heading', 'paragraph'].includes(f.type) &&
      evaluateFieldVisibility(f, formData, form.fields)
    );
  }, [form.fields, formData]);

  const totalSteps = visibleInputFields.length;
  const currentField = visibleInputFields[currentStep];
  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0;

  const updateFieldValue = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  const canProceed = useCallback(() => {
    if (!currentField) return false;
    if (!currentField.required) return true;
    const value = formData[currentField.id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  }, [currentField, formData]);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection('down');
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection('up');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || isSubmitting) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't intercept Enter in textarea
        if (currentField?.type === 'textarea') return;
        e.preventDefault();
        if (currentStep === totalSteps - 1) {
          handleSubmit();
        } else if (canProceed()) {
          goNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, canProceed, goNext, isComplete, isSubmitting, currentField, totalSteps]);

  const handleSubmit = async () => {
    if (honeypot) {
      toast.success(form.settings.successMessage);
      return;
    }

    // Validate all required fields
    const missingFields = inputFields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('form-submission-handler', {
        body: { formId: form.id, data: formData, honeypot }
      });

      if (error) throw error;

      const submission: FormSubmission = {
        id: response?.submissionId || `submission_${Date.now()}`,
        formId: form.id,
        data: formData,
        submittedAt: new Date().toISOString()
      };

      onSubmit?.(submission);
      setIsComplete(true);

      if (form.settings.redirectUrl) {
        setTimeout(() => {
          window.location.href = form.settings.redirectUrl!;
        }, 2000);
      }
    } catch {
      toast.error("Erreur lors de l'envoi du formulaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
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
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
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
          <Input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            required={field.required}
            className={commonClass}
            autoFocus
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            required={field.required}
            className={commonClass}
            autoFocus
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder || 'Tapez votre réponse ici...'}
            required={field.required}
            maxLength={field.maxLength}
            rows={3}
            className="text-lg border-0 border-b-2 border-muted rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary resize-none transition-colors"
            autoFocus
          />
        );

      case 'select':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  updateFieldValue(field.id, option);
                  // Auto-advance after selection
                  if (currentStep < totalSteps - 1) {
                    setTimeout(() => goNext(), 400);
                  }
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-base",
                  "hover:border-primary hover:bg-primary/5",
                  formData[field.id] === option
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border text-xs font-medium mr-3 bg-muted">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  updateFieldValue(field.id, option);
                  if (currentStep < totalSteps - 1) {
                    setTimeout(() => goNext(), 400);
                  }
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-base",
                  "hover:border-primary hover:bg-primary/5",
                  formData[field.id] === option
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground"
                )}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium mr-3 bg-muted">
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
              const isChecked = (formData[field.id] || []).includes(option);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const currentValues = formData[field.id] || [];
                    if (isChecked) {
                      updateFieldValue(field.id, currentValues.filter((v: string) => v !== option));
                    } else {
                      updateFieldValue(field.id, [...currentValues, option]);
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
                  updateFieldValue(field.id, star);
                  if (currentStep < totalSteps - 1) {
                    setTimeout(() => goNext(), 400);
                  }
                }}
                className={cn(
                  "text-4xl transition-all duration-200 hover:scale-110",
                  formData[field.id] >= star ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'
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

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {form.settings.successMessage}
          </h2>
          {form.settings.redirectUrl && (
            <p className="text-muted-foreground text-sm">Redirection en cours...</p>
          )}
        </div>
      </div>
    );
  }

  if (totalSteps === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Ce formulaire ne contient aucun champ.
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div ref={containerRef} className="min-h-[60vh] flex flex-col">
      {/* Honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <Input
          type="text"
          name="website_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Progress bar */}
      {form.settings.showProgressBar !== false && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {currentStep + 1} sur {totalSteps}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Form title (only on first step) */}
      {currentStep === 0 && form.name && (
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground mt-2 text-lg">{form.description}</p>
          )}
        </div>
      )}

      {/* Current question */}
      <div className="flex-1 flex flex-col justify-center">
        <div
          key={currentField.id}
          className={cn(
            "space-y-6 transition-all duration-300",
            direction === 'down' ? 'animate-fade-in' : 'animate-fade-in'
          )}
        >
          {/* Step number + label */}
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-primary font-bold text-lg">{currentStep + 1}</span>
              <ArrowRight className="h-4 w-4 text-primary" />
              <Label className="text-xl font-semibold text-foreground">
                {currentField.label}
                {currentField.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {currentField.description && (
              <p className="text-muted-foreground text-sm ml-8">{currentField.description}</p>
            )}
          </div>

          {/* Field */}
          <div className="ml-8">
            {renderField(currentField)}
          </div>

          {/* Action buttons */}
          <div className="ml-8 flex items-center gap-3 pt-4">
            {!['select', 'radio', 'rating'].includes(currentField.type) && (
              <Button
                onClick={isLastStep ? handleSubmit : goNext}
                disabled={!canProceed() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting
                  ? 'Envoi...'
                  : isLastStep
                  ? form.settings.submitButtonText
                  : 'OK'}
                {!isSubmitting && <Check className="h-4 w-4" />}
              </Button>
            )}
            {isLastStep && ['select', 'radio', 'rating'].includes(currentField.type) && (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? 'Envoi...' : form.settings.submitButtonText}
                {!isSubmitting && <Check className="h-4 w-4" />}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              appuyez sur <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Entrée ↵</kbd>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="h-8 w-8"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            disabled={currentStep >= totalSteps - 1}
            className="h-8 w-8"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          Propulsé par <span className="font-semibold">Fatras</span>
        </span>
      </div>
    </div>
  );
};

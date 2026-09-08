import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormField, FormSubmission } from './types';
import { ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormThemeWrapper } from './FormThemeWrapper';
import { evaluateFieldVisibility } from './conditionalLogic';
import { FormThankYou } from './FormThankYou';
import { SteppedFieldRenderer } from './SteppedFieldRenderer';

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

  const visibleInputFields = useMemo(() => {
    return form.fields.filter(f => !['heading', 'paragraph'].includes(f.type) && evaluateFieldVisibility(f, formData, form.fields));
  }, [form.fields, formData]);

  const totalSteps = visibleInputFields.length;
  const currentField = visibleInputFields[currentStep];
  const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0;
  const theme = form.settings.formTheme;

  useEffect(() => {
    if (currentStep >= totalSteps && totalSteps > 0) setCurrentStep(totalSteps - 1);
  }, [totalSteps, currentStep]);

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
    if (currentStep < totalSteps - 1) { setDirection('down'); setCurrentStep(prev => prev + 1); }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) { setDirection('up'); setCurrentStep(prev => prev - 1); }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || isSubmitting) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        if (currentField?.type === 'textarea') return;
        e.preventDefault();
        if (currentStep === totalSteps - 1) handleSubmit();
        else if (canProceed()) goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, canProceed, goNext, isComplete, isSubmitting, currentField, totalSteps]);

  const handleSubmit = async () => {
    
    const missingFields = visibleInputFields.filter(field => field.required && !formData[field.id]).map(field => field.label);
    if (missingFields.length > 0) { toast.error(`Champs obligatoires manquants: ${missingFields.join(', ')}`); return; }
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('form-submission-handler', { body: { formId: form.id, data: formData, honeypot } });
      if (error) throw error;
      const submission: FormSubmission = { id: response?.submissionId || `submission_${Date.now()}`, formId: form.id, data: formData, submittedAt: new Date().toISOString() };
      onSubmit?.(submission);
      setIsComplete(true);
      if (form.settings.redirectUrl) setTimeout(() => { window.location.href = form.settings.redirectUrl!; }, 2000);
    } catch { toast.error("Erreur lors de l'envoi du formulaire"); }
    finally { setIsSubmitting(false); }
  };

  if (isComplete) {
    return <FormThemeWrapper theme={theme}><FormThankYou config={form.settings.thankYouPage} fallbackMessage={form.settings.successMessage} redirectUrl={form.settings.redirectUrl} /></FormThemeWrapper>;
  }

  if (totalSteps === 0) {
    return <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">Ce formulaire ne contient aucun champ.</div>;
  }

  const isLastStep = currentStep === totalSteps - 1;
  const buttonStyle: React.CSSProperties = theme?.buttonColor ? { backgroundColor: theme.buttonColor, color: theme.buttonTextColor || '#ffffff', borderColor: theme.buttonColor } : {};

  const handleAutoAdvance = () => {
    if (currentStep < totalSteps - 1) goNext();
  };

  return (
    <FormThemeWrapper theme={theme}>
      <div ref={containerRef} className="min-h-[50vh] sm:min-h-[60vh] flex flex-col">
        <div className="absolute left-[-9999px]" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <Input type="text" name="fx_hp_check" id="fx_hp_check" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" data-lpignore="true" data-form-type="other" />
        </div>

        {form.settings.showProgressBar !== false && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground font-medium">{currentStep + 1} sur {totalSteps}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {currentStep === 0 && form.name && (
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{form.name}</h1>
            {form.description && <p className="text-muted-foreground mt-2 text-base sm:text-lg">{form.description}</p>}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <div key={currentField.id} className={cn("space-y-6 transition-all duration-300", "animate-fade-in")}>
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-primary font-bold text-lg">{currentStep + 1}</span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <Label className="text-lg sm:text-xl font-semibold text-foreground">
                  {currentField.label}{currentField.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              </div>
              {currentField.description && <p className="text-muted-foreground text-sm ml-0 sm:ml-8">{currentField.description}</p>}
            </div>

            <div className="ml-0 sm:ml-8">
              <SteppedFieldRenderer field={currentField} value={formData[currentField.id]} onChange={updateFieldValue} onAutoAdvance={handleAutoAdvance} />
            </div>

            <div className="ml-0 sm:ml-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4">
              {!['select', 'radio', 'rating'].includes(currentField.type) && (
                <Button onClick={isLastStep ? handleSubmit : goNext} disabled={!canProceed() || isSubmitting} className="gap-2" style={buttonStyle}>
                  {isSubmitting ? 'Envoi...' : isLastStep ? form.settings.submitButtonText : 'OK'}
                  {!isSubmitting && <Check className="h-4 w-4" />}
                </Button>
              )}
              {isLastStep && ['select', 'radio', 'rating'].includes(currentField.type) && (
                <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="gap-2" style={buttonStyle}>
                  {isSubmitting ? 'Envoi...' : form.settings.submitButtonText}
                  {!isSubmitting && <Check className="h-4 w-4" />}
                </Button>
              )}
              <span className="text-xs text-muted-foreground hidden sm:inline">
                appuyez sur <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Entrée ↵</kbd>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={goPrev} disabled={currentStep === 0} className="h-8 w-8"><ChevronUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={goNext} disabled={currentStep >= totalSteps - 1} className="h-8 w-8"><ChevronDown className="h-4 w-4" /></Button>
          </div>
          <span className="text-xs text-muted-foreground">Propulsé par <span className="font-semibold">Fatras</span></span>
        </div>
      </div>
    </FormThemeWrapper>
  );
};

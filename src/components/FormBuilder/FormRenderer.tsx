
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
import { FormData, FormSubmission } from './types';

interface FormRendererProps {
  form: FormData;
  onSubmit?: (submission: FormSubmission) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ form, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const submission: FormSubmission = {
        id: `submission_${Date.now()}`,
        formId: form.id,
        data: formData,
        submittedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to contacts if enabled
      if (form.settings.addToContacts) {
        const contact = {
          id: `contact_${Date.now()}`,
          name: formData.name || formData.firstName || 'Contact sans nom',
          email: formData.email,
          phone: formData.phone || formData.tel,
          source: `Formulaire: ${form.name}`,
          createdAt: new Date().toISOString(),
          ...formData
        };
        
        // Here you would normally save to your contact database
        console.log('Adding contact:', contact);
      }

      // Send notification if enabled
      if (form.settings.sendNotification && form.settings.notificationEmail) {
        console.log('Sending notification to:', form.settings.notificationEmail);
        // Here you would send an email notification
      }

      onSubmit?.(submission);
      toast.success(form.settings.successMessage);
      setFormData({});
    } catch (error) {
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
        return (
          <Input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
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

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{form.name}</CardTitle>
        {form.description && (
          <p className="text-sm text-gray-600">{form.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Envoi en cours...' : form.settings.submitButtonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

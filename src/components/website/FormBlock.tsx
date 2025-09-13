import React, { useState, useEffect } from 'react';
import { FormRenderer } from '@/components/FormBuilder/FormRenderer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { FormData } from '@/components/FormBuilder/types';

interface FormBlockProps {
  formId: string;
  customTitle?: string;
}

export const FormBlock: React.FC<FormBlockProps> = ({ formId, customTitle }) => {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        setError('Aucun formulaire sélectionné');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('id', formId)
          .single();

        if (error) throw error;

        if (data) {
          const formData: FormData = {
            id: data.id,
            name: customTitle || data.name,
            description: data.description || '',
            fields: typeof data.fields === 'string' ? JSON.parse(data.fields) : (data.fields || []),
            settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {
              submitButtonText: 'Envoyer',
              successMessage: 'Merci pour votre message !',
              sendNotification: true,
              notificationEmail: '',
              addToContacts: true
            })
          };
          setForm(formData);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du formulaire:', error);
        setError('Impossible de charger le formulaire');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, customTitle]);

  const handleFormSubmit = async (submission: any) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('form-submission-handler', {
        body: {
          formId,
          data: submission.data,
        },
      });

      if (error) throw error;
      console.log('Soumission enregistrée:', result);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !form) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error || 'Formulaire non trouvé'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <FormRenderer form={form} onSubmit={handleFormSubmit} />;
};
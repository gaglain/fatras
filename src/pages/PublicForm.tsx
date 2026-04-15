import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FormRenderer } from '@/components/FormBuilder/FormRenderer';
import { FormData } from '@/components/FormBuilder/types';
import { Loader2 } from 'lucide-react';

const PublicForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) { setError('Formulaire introuvable'); setLoading(false); return; }
      try {
        const { data, error: fetchError } = await supabase
          .from('forms')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !data) {
          setError('Ce formulaire n\'existe pas ou n\'est plus disponible.');
          return;
        }

        setForm({
          id: data.id,
          name: data.name,
          description: data.description || '',
          fields: Array.isArray(data.fields) ? data.fields : JSON.parse(data.fields as string),
          settings: typeof data.settings === 'object' ? data.settings as any : JSON.parse(data.settings as string),
        });
      } catch {
        setError('Erreur lors du chargement du formulaire.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-foreground">Formulaire introuvable</h1>
          <p className="text-muted-foreground">{error || 'Ce formulaire n\'est plus disponible.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <FormRenderer form={form} />
      </div>
    </div>
  );
};

export default PublicForm;

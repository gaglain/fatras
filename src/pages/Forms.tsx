import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormBuilder } from '@/components/FormBuilder/FormBuilder';
import { FormRenderer } from '@/components/FormBuilder/FormRenderer';
import { FormData } from '@/components/FormBuilder/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const Forms: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<FormData | null>(null);
  const [previewForm, setPreviewForm] = useState<FormData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedForms: FormData[] = data.map(form => ({
        id: form.id,
        name: form.name,
        description: form.description || '',
        fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : (form.fields || []),
        settings: typeof form.settings === 'string' ? JSON.parse(form.settings) : (form.settings || {
          submitButtonText: 'Envoyer',
          successMessage: 'Merci pour votre message !',
          sendNotification: true,
          notificationEmail: '',
          addToContacts: true
        })
      }));

      setForms(formattedForms);
    } catch (error) {
      console.error('Erreur lors du chargement des formulaires:', error);
      toast.error('Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async (formData: FormData) => {
    if (!user) return;

    try {
      const dbData = {
        name: formData.name,
        description: formData.description,
        fields: JSON.stringify(formData.fields),
        settings: JSON.stringify(formData.settings),
        user_id: user.id
      };

      if (editingForm) {
        const { error } = await supabase
          .from('forms')
          .update(dbData)
          .eq('id', editingForm.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Formulaire modifié avec succès');
      } else {
        const { error } = await supabase
          .from('forms')
          .insert(dbData);

        if (error) throw error;
        toast.success('Formulaire créé avec succès');
      }

      setShowBuilder(false);
      setEditingForm(null);
      await fetchForms();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du formulaire');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!user || !window.confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Formulaire supprimé');
      await fetchForms();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditForm = (form: FormData) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  const handlePreviewForm = (form: FormData) => {
    setPreviewForm(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Formulaires</h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez vos formulaires personnalisés
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingForm(null);
            setShowBuilder(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau formulaire
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire</h3>
              <p className="text-gray-500 mb-4">Créez votre premier formulaire pour commencer</p>
              <Button 
                onClick={() => {
                  setEditingForm(null);
                  setShowBuilder(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un formulaire
              </Button>
            </div>
          ) : (
            forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  {form.description && (
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {form.fields.length} champ{form.fields.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewForm(form)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditForm(form)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Form Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Modifier le formulaire' : 'Nouveau formulaire'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            initialForm={editingForm || undefined}
            onSave={handleSaveForm}
            onPreview={(form) => setPreviewForm(form)}
          />
        </DialogContent>
      </Dialog>

      {/* Form Preview Dialog */}
      <Dialog open={!!previewForm} onOpenChange={() => setPreviewForm(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du formulaire</DialogTitle>
          </DialogHeader>
          {previewForm && (
            <FormRenderer
              form={previewForm}
              onSubmit={(data) => {
                console.log('Form submitted:', data);
                toast.success('Formulaire soumis (mode aperçu)');
              }}
              
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
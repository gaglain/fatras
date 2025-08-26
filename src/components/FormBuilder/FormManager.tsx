import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FormData } from './types';
import { FormBuilder } from './FormBuilder';
import { FormRenderer } from './FormRenderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, FileText } from 'lucide-react';

export const FormManager: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormData | null>(null);
  const [editingForm, setEditingForm] = useState<FormData | null>(null);

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

      const formsData = data?.map(form => ({
        id: form.id,
        name: form.name,
        description: form.description || '',
        fields: form.fields || [],
        settings: form.settings || {
          submitButtonText: 'Envoyer',
          successMessage: 'Merci pour votre message !',
          sendNotification: true,
          notificationEmail: '',
          addToContacts: true
        }
      })) || [];

      setForms(formsData);
    } catch (error) {
      console.error('Erreur lors du chargement des formulaires:', error);
      toast.error('Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async (formData: FormData) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      if (editingForm) {
        // Mise à jour
        const { error } = await supabase
          .from('forms')
          .update({
            name: formData.name,
            description: formData.description,
            fields: formData.fields,
            settings: formData.settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingForm.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Formulaire mis à jour');
      } else {
        // Création
        const { error } = await supabase
          .from('forms')
          .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            fields: formData.fields,
            settings: formData.settings
          });

        if (error) throw error;
        toast.success('Formulaire créé');
      }

      setShowBuilder(false);
      setEditingForm(null);
      fetchForms();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du formulaire');
    }
  };

  const deleteForm = async (formId: string) => {
    if (!user) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Formulaire supprimé');
      fetchForms();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (form: FormData) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  const handlePreview = (form: FormData) => {
    setPreviewForm(form);
  };

  useEffect(() => {
    fetchForms();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des formulaires</h1>
          <p className="text-muted-foreground">Créez et gérez vos formulaires personnalisés</p>
        </div>
        <Button onClick={() => { setEditingForm(null); setShowBuilder(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau formulaire
        </Button>
      </div>

      {/* Liste des formulaires */}
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun formulaire</h3>
          <p className="text-gray-500 mb-4">Créez votre premier formulaire</p>
          <Button onClick={() => { setEditingForm(null); setShowBuilder(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un formulaire
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                  </div>
                  <Badge variant="secondary">{form.fields.length} champs</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(form)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(form)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteForm(form.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de création/édition */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Modifier le formulaire' : 'Créer un nouveau formulaire'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            initialForm={editingForm || undefined}
            onSave={saveForm}
            onPreview={handlePreview}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de prévisualisation */}
      <Dialog open={!!previewForm} onOpenChange={() => setPreviewForm(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du formulaire</DialogTitle>
          </DialogHeader>
          {previewForm && (
            <FormRenderer
              form={previewForm}
              onSubmit={(submission) => {
                console.log('Prévisualisation soumission:', submission);
                toast.success('Formulaire soumis (aperçu uniquement)');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
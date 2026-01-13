import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Code, FileText, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FormBuilder } from '@/components/FormBuilder/FormBuilder';
import { FormRenderer } from '@/components/FormBuilder/FormRenderer';
import { FormSubmissions } from '@/components/FormBuilder/FormSubmissions';
import { FormEmbedCode } from '@/components/FormBuilder/FormEmbedCode';
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
  const [embedForm, setEmbedForm] = useState<FormData | null>(null);
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
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditForm = (form: FormData) => {
    setEditingForm(form);
    setShowBuilder(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Formulaires</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Créez des formulaires personnalisés style TypeForm
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingForm(null);
            setShowBuilder(true);
          }}
          className="bg-primary hover:bg-primary/90 w-full md:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Nouveau formulaire</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </div>

      <Tabs defaultValue="forms" className="space-y-4 md:space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="forms" className="gap-1.5 flex-1 md:flex-initial text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Formulaires</span>
            <span className="sm:hidden">Forms</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{forms.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-1.5 flex-1 md:flex-initial text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Soumissions</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Aucun formulaire</h3>
                  <p className="text-muted-foreground mb-4">Créez votre premier formulaire pour commencer</p>
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
                  <Card key={form.id} className="hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {form.name}
                        <Badge variant="outline" className="text-xs font-normal">
                          {form.fields.length} champ{form.fields.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      {form.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewForm(form)}
                          title="Aperçu"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmbedForm(form)}
                          title="Code d'intégration"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditForm(form)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteForm(form.id)}
                          className="text-destructive hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions">
          <FormSubmissions forms={forms} />
        </TabsContent>
      </Tabs>

      {/* Form Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
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
              onSubmit={() => {
                toast.success('Formulaire soumis (mode aperçu)');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={!!embedForm} onOpenChange={() => setEmbedForm(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Code d'intégration</DialogTitle>
          </DialogHeader>
          {embedForm && <FormEmbedCode form={embedForm} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

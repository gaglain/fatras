import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Save, Copy, File, ArrowLeft } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  default_terms?: string;
  default_items: TemplateItem[];
  created_at: string;
  updated_at: string;
}

interface TemplateItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface QuoteTemplateManagerProps {
  onApplyTemplate?: (template: QuoteTemplate) => void;
}

const emptyForm = () => ({
  name: '',
  description: '',
  category: 'standard',
  default_terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
  items: [{ name: '', description: '', quantity: 1, unit_price: 0 }] as TemplateItem[]
});

export const QuoteTemplateManager: React.FC<QuoteTemplateManagerProps> = ({
  onApplyTemplate
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(template => ({
        ...template,
        default_items: Array.isArray(template.default_items)
          ? (template.default_items as unknown as TemplateItem[])
          : typeof template.default_items === 'string'
          ? JSON.parse(template.default_items) as TemplateItem[]
          : []
      })));
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
      toast.error('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error('Le nom du modèle est obligatoire');
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].name.trim()) {
      toast.error('Au moins un élément est requis');
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        default_terms: formData.default_terms,
        default_items: formData.items as unknown as never
      };

      if (editingTemplate) {
        const { data, error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', editingTemplate.id)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          toast.error("Modification refusée : ce modèle n'est pas modifiable par votre compte");
          return;
        }
        toast.success('Modèle mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('quote_templates')
          .insert([{ user_id: user.id, ...templateData }]);

        if (error) throw error;
        toast.success('Modèle créé avec succès');
      }

      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      toast.error(error?.message || 'Erreur lors de la sauvegarde du modèle');
    } finally {
      setSaving(false);
    }
  };

  const confirmAction = useConfirm();
  const handleDeleteTemplate = async (templateId: string) => {
    const ok = await confirmAction({ title: 'Supprimer le modèle', description: 'Êtes-vous sûr de vouloir supprimer ce modèle ?', variant: 'destructive' });
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('quote_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Modèle supprimé avec succès');
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditTemplate = (template: QuoteTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      default_terms: template.default_terms || '',
      items: template.default_items.length > 0 ? template.default_items : [{ name: '', description: '', quantity: 1, unit_price: 0 }]
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingTemplate(null);
    setShowForm(false);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof TemplateItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Chargement des modèles...</div>;
  }

  if (showForm) {
    return (
      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetForm} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base sm:text-lg">
              {editingTemplate ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="templateName">Nom du modèle *</Label>
              <Input
                id="templateName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Spectacle standard"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="templateCategory">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger id="templateCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="spectacle">Spectacle</SelectItem>
                  <SelectItem value="formation">Formation</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du modèle"
              rows={2}
            />
          </div>

          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
              <Label>Éléments par défaut</Label>
              <Button onClick={addItem} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un élément
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label>Nom de l'élément</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Service ou produit"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Détails"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Label>Prix unitaire (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <Button
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="templateTerms">Conditions générales par défaut</Label>
            <Textarea
              id="templateTerms"
              value={formData.default_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, default_terms: e.target.value }))}
              placeholder="Conditions de paiement, délais, etc."
              rows={3}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Enregistrer' : 'Créer'} le modèle
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <File className="h-5 w-5" />
            Modèles de Devis
          </CardTitle>
          <Button onClick={() => { setEditingTemplate(null); setFormData(emptyForm()); setShowForm(true); }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Modèle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Aucun modèle de devis créé</p>
            <p className="text-sm">Créez votre premier modèle pour gagner du temps</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium break-words">{template.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {template.description || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.default_items.length} élément(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:shrink-0">
                  {onApplyTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyTemplate(template)}
                      className="flex-1 sm:flex-initial"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Utiliser
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 sm:flex-initial"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-destructive flex-1 sm:flex-initial"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

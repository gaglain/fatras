import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Save, Copy, File } from 'lucide-react';
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

export const QuoteTemplateManager: React.FC<QuoteTemplateManagerProps> = ({
  onApplyTemplate
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'standard',
    default_terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
    items: [{ name: '', description: '', quantity: 1, unit_price: 0 }] as TemplateItem[]
  });

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

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        default_terms: formData.default_terms,
        default_items: JSON.stringify(formData.items)
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Modèle mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('quote_templates')
          .insert([{
            user_id: user.id,
            ...templateData
          }]);

        if (error) throw error;
        toast.success('Modèle créé avec succès');
      }

      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      toast.error('Erreur lors de la sauvegarde du modèle');
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
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'standard',
      default_terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
      items: [{ name: '', description: '', quantity: 1, unit_price: 0 }]
    });
    setEditingTemplate(null);
    setShowCreateDialog(false);
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
    return <div>Chargement des modèles...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Modèles de Devis
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Modèle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Modifier le modèle' : 'Créer un nouveau modèle'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateName">Nom du modèle *</Label>
                    <Input
                      id="templateName"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Spectacle standard"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateCategory">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
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

                <div>
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea
                    id="templateDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du modèle"
                    rows={2}
                  />
                </div>

                {/* Items du modèle */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Éléments par défaut</Label>
                    <Button onClick={addItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un élément
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Nom de l'élément</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                              placeholder="Service ou produit"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Détails"
                            />
                          </div>
                          <div>
                            <Label>Quantité</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                            />
                          </div>
                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
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
                                className="text-red-600"
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

                <div>
                  <Label htmlFor="templateTerms">Conditions générales par défaut</Label>
                  <Textarea
                    id="templateTerms"
                    value={formData.default_terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_terms: e.target.value }))}
                    placeholder="Conditions de paiement, délais, etc."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'Modifier' : 'Créer'} le modèle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Aucun modèle de devis créé</p>
            <p className="text-sm">Créez votre premier modèle pour gagner du temps</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Éléments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {template.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.description || '-'}
                  </TableCell>
                  <TableCell>
                    {template.default_items.length} élément(s)
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {onApplyTemplate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApplyTemplate(template)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Utiliser
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
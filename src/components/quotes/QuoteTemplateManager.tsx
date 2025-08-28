import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  default_terms: string;
  default_items: Array<{
    name: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  category: string;
  created_at: string;
}

interface QuoteTemplateManagerProps {
  onTemplateSelect?: (template: QuoteTemplate) => void;
}

export const QuoteTemplateManager: React.FC<QuoteTemplateManagerProps> = ({ onTemplateSelect }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_terms: '',
    category: 'standard',
    default_items: [] as Array<{
      name: string;
      description: string;
      quantity: number;
      unit_price: number;
    }>
  });

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
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
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const templateData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        default_terms: formData.default_terms,
        category: formData.category,
        default_items: formData.default_items
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
          .insert([templateData]);

        if (error) throw error;
        toast.success('Modèle créé avec succès');
      }

      await fetchTemplates();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde du modèle');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: QuoteTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      default_terms: template.default_terms,
      category: template.category,
      default_items: template.default_items || []
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quote_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTemplates();
      toast.success('Modèle supprimé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      default_terms: '',
      category: 'standard',
      default_items: []
    });
    setEditingTemplate(null);
  };

  const addDefaultItem = () => {
    setFormData({
      ...formData,
      default_items: [
        ...formData.default_items,
        { name: '', description: '', quantity: 1, unit_price: 0 }
      ]
    });
  };

  const updateDefaultItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.default_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, default_items: updatedItems });
  };

  const removeDefaultItem = (index: number) => {
    setFormData({
      ...formData,
      default_items: formData.default_items.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Modèles de Devis</CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Modèle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Modifier le modèle' : 'Créer un modèle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du modèle *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="spectacle">Spectacle</SelectItem>
                        <SelectItem value="evenement">Événement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Conditions par défaut</Label>
                  <Textarea
                    id="terms"
                    value={formData.default_terms}
                    onChange={(e) => setFormData({ ...formData, default_terms: e.target.value })}
                    rows={3}
                    placeholder="Conditions générales, modalités de paiement..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Éléments par défaut</Label>
                    <Button type="button" variant="outline" onClick={addDefaultItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter élément
                    </Button>
                  </div>
                  
                  {formData.default_items.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Prix unitaire</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.default_items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateDefaultItem(index, 'name', e.target.value)}
                                  placeholder="Nom de l'élément"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateDefaultItem(index, 'description', e.target.value)}
                                  placeholder="Description"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateDefaultItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateDefaultItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDefaultItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun modèle de devis créé
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {onTemplateSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTemplateSelect(template)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Utiliser
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
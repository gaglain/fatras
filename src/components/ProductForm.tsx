
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: any;
  onSave: (product: any) => void;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    stockQuantity: product?.stockQuantity || 0,
    status: product?.status || 'active',
    images: product?.images || [],
    variations: product?.variations || []
  });

  const [newVariation, setNewVariation] = useState({
    name: '',
    price: 0,
    stockQuantity: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    const productData = {
      ...formData,
      id: product?.id || `product-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    onSave(productData);
    toast.success(product ? 'Produit modifié' : 'Produit créé');
    onClose();
  };

  const addVariation = () => {
    if (!newVariation.name.trim()) {
      toast.error('Le nom de la variation est requis');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, {
        ...newVariation,
        id: `var-${Date.now()}`
      }]
    }));

    setNewVariation({ name: '', price: 0, stockQuantity: 0 });
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card style={{
      backgroundColor: 'var(--app-card-bg, #ffffff)',
      color: 'var(--app-card-text, #18181b)',
      border: '1px solid var(--notification-border, #e5e7eb)'
    }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
          {product ? 'Modifier le produit' : 'Nouveau produit'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom du produit *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du produit"
                required
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vêtements">Vêtements</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                  <SelectItem value="Musique">Musique</SelectItem>
                  <SelectItem value="Décoration">Décoration</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                style={{
                  backgroundColor: 'var(--app-background, #ffffff)',
                  color: 'var(--app-text, #18181b)',
                  borderColor: 'var(--notification-border, #e5e7eb)'
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du produit"
              rows={3}
              style={{
                backgroundColor: 'var(--app-background, #ffffff)',
                color: 'var(--app-text, #18181b)',
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Variations du produit</Label>
            </div>
            
            {formData.variations.length > 0 && (
              <div className="space-y-2">
                {formData.variations.map((variation: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{variation.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {variation.price}€ - Stock: {variation.stockQuantity}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariation(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Nom variation"
                value={newVariation.name}
                onChange={(e) => setNewVariation(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Prix"
                value={newVariation.price}
                onChange={(e) => setNewVariation(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                type="number"
                placeholder="Stock"
                value={newVariation.stockQuantity}
                onChange={(e) => setNewVariation(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
              />
              <Button type="button" onClick={addVariation} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit"
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {product ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

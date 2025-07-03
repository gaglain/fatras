
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Variation {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  sku?: string;
}

interface VariationManagerProps {
  variations: Variation[];
  onVariationsChange: (variations: Variation[]) => void;
}

export const VariationManager: React.FC<VariationManagerProps> = ({ 
  variations, 
  onVariationsChange 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stockQuantity: 0,
    sku: ''
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom de la variation est requis');
      return;
    }

    const newVariation: Variation = {
      id: `variation-${Date.now()}`,
      name: formData.name,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      sku: formData.sku
    };

    onVariationsChange([...variations, newVariation]);
    setFormData({ name: '', price: 0, stockQuantity: 0, sku: '' });
    setIsCreating(false);
    toast.success('Variation créée avec succès');
  };

  const handleEdit = (variation: Variation) => {
    setEditingId(variation.id);
    setFormData({
      name: variation.name,
      price: variation.price,
      stockQuantity: variation.stockQuantity,
      sku: variation.sku || ''
    });
  };

  const handleUpdate = () => {
    const updatedVariations = variations.map(v => 
      v.id === editingId 
        ? { ...v, ...formData }
        : v
    );
    onVariationsChange(updatedVariations);
    setEditingId(null);
    setFormData({ name: '', price: 0, stockQuantity: 0, sku: '' });
    toast.success('Variation modifiée avec succès');
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette variation ?')) {
      onVariationsChange(variations.filter(v => v.id !== id));
      toast.success('Variation supprimée');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, stockQuantity: 0, sku: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <Card style={{
      backgroundColor: 'var(--app-card-bg, #ffffff)',
      color: 'var(--app-card-text, #18181b)',
      border: '1px solid var(--notification-border, #e5e7eb)'
    }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
            Gestion des Variations
          </CardTitle>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Variation
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form for creating/editing */}
        {(isCreating || editingId) && (
          <div className="p-4 border rounded-lg space-y-4" style={{
            borderColor: 'var(--notification-border, #e5e7eb)',
            backgroundColor: 'var(--app-background, #f9f9f9)'
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de la variation *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Taille S, Couleur Rouge..."
                />
              </div>
              <div>
                <Label>SKU (optionnel)</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Code produit"
                />
              </div>
              <div>
                <Label>Prix (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                style={{
                  backgroundColor: 'var(--app-button-bg, #1632f4)',
                  color: 'var(--app-button-text, #ffffff)'
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* List of variations */}
        <div className="space-y-2">
          {variations.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--app-text, #666666)' }}>
              <p>Aucune variation créée</p>
              <p className="text-sm">Cliquez sur "Nouvelle Variation" pour commencer</p>
            </div>
          ) : (
            variations.map((variation) => (
              <div
                key={variation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{variation.name}</span>
                    {variation.sku && (
                      <Badge variant="outline" className="text-xs">
                        {variation.sku}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                    Prix: {variation.price}€ • Stock: {variation.stockQuantity}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(variation)}
                    style={{
                      borderColor: 'var(--app-button-bg, #1632f4)',
                      color: 'var(--app-button-bg, #1632f4)'
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(variation.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

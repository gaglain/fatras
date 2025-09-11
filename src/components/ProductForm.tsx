
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUpload } from './MediaUpload';
import { useProducts } from '@/hooks/useProducts';

interface ProductFormProps {
  product?: any;
  onSave: (product: any) => void;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose }) => {
  const { createProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    stock_quantity: product?.stock_quantity || 0,
    status: product?.status || 'active',
    images: product?.images || [],
    attributes: product?.attributes || [],
    variations: product?.variations || []
  });

  const [newAttribute, setNewAttribute] = useState({
    name: '',
    values: ''
  });

  const [newVariation, setNewVariation] = useState({
    name: '',
    price: 0,
    stock_quantity: 0,
    attributes: {} as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      
      onSave(formData);
      onClose();
    } catch (error) {
      // L'erreur est déjà affichée dans le hook
    }
  };

  const addAttribute = () => {
    if (!newAttribute.name.trim() || !newAttribute.values.trim()) {
      toast.error('Le nom et les valeurs de l\'attribut sont requis');
      return;
    }

    const attribute = {
      id: `attr-${Date.now()}`,
      name: newAttribute.name,
      values: newAttribute.values.split(',').map(v => v.trim())
    };

    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, attribute]
    }));

    setNewAttribute({ name: '', values: '' });
    toast.success('Attribut ajouté');
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
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

    setNewVariation({ name: '', price: 0, stock_quantity: 0, attributes: {} });
    toast.success('Variation ajoutée');
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const handleMediaRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
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
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
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
              />
            </div>

            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                placeholder="0"
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
            />
          </div>

          {/* Images du produit */}
          <div className="space-y-4">
            <Label className="text-base">Images du produit</Label>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Produit ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleMediaRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <MediaUpload
              onMediaUploaded={handleMediaUpload}
              onMediaRemoved={() => {}}
            />
          </div>

          {/* Attributs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Attributs du produit</Label>
            </div>
            
            {formData.attributes.length > 0 && (
              <div className="space-y-2">
                {formData.attributes.map((attribute: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{attribute.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {attribute.values.map((value: string, vIndex: number) => (
                          <Badge key={vIndex} variant="outline" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Nom attribut (ex: Couleur)"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Valeurs (Rouge, Bleu, Vert)"
                value={newAttribute.values}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, values: e.target.value }))}
              />
              <Button type="button" onClick={addAttribute} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
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
                        {variation.price}€ - Stock: {variation.stock_quantity}
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
                value={newVariation.stock_quantity}
                onChange={(e) => setNewVariation(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
              />
              <Button type="button" onClick={addVariation} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {product ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

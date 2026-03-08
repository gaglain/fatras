
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
  variation: boolean;
}

interface ProductVariation {
  id: string;
  attributes: { [key: string]: string };
  price: number;
  stockQuantity: number;
  sku?: string;
  image?: string;
}

interface ProductVariationManagerProps {
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  onAttributesChange: (attributes: ProductAttribute[]) => void;
  onVariationsChange: (variations: ProductVariation[]) => void;
}

export const ProductVariationManager: React.FC<ProductVariationManagerProps> = ({
  attributes,
  variations,
  onAttributesChange,
  onVariationsChange
}) => {
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [editingVariation, setEditingVariation] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState({ name: '', values: '', variation: true });
  const [variationForm, setVariationForm] = useState<Partial<ProductVariation>>({});

  // Ajouter un attribut
  const handleAddAttribute = () => {
    if (!newAttribute.name.trim() || !newAttribute.values.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const attribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      name: newAttribute.name,
      values: newAttribute.values.split(',').map(v => v.trim()),
      variation: newAttribute.variation
    };

    onAttributesChange([...attributes, attribute]);
    setNewAttribute({ name: '', values: '', variation: true });
    setIsAddingAttribute(false);
    toast.success('Attribut ajouté avec succès');
  };

  // Supprimer un attribut
  const handleDeleteAttribute = (attributeId: string) => {
    if (confirm('Supprimer cet attribut supprimera aussi toutes les variations associées. Continuer ?')) {
      const updatedAttributes = attributes.filter(attr => attr.id !== attributeId);
      onAttributesChange(updatedAttributes);
      
      // Supprimer les variations qui utilisent cet attribut
      const attributeName = attributes.find(attr => attr.id === attributeId)?.name;
      if (attributeName) {
        const updatedVariations = variations.filter(variation => 
          !Object.keys(variation.attributes).includes(attributeName)
        );
        onVariationsChange(updatedVariations);
      }
      
      toast.success('Attribut supprimé');
    }
  };

  // Générer toutes les combinaisons possibles
  const generateVariations = () => {
    const variationAttributes = attributes.filter(attr => attr.variation);
    
    if (variationAttributes.length === 0) {
      toast.error('Aucun attribut de variation défini');
      return;
    }

    const combinations: { [key: string]: string }[] = [];
    
    const generateCombinations = (index: number, current: { [key: string]: string }) => {
      if (index === variationAttributes.length) {
        combinations.push({ ...current });
        return;
      }
      
      const attribute = variationAttributes[index];
      attribute.values.forEach(value => {
        current[attribute.name] = value;
        generateCombinations(index + 1, current);
      });
    };
    
    generateCombinations(0, {});
    
    const newVariations: ProductVariation[] = combinations.map((attrs, index) => ({
      id: `var-${Date.now()}-${index}`,
      attributes: attrs,
      price: 0,
      stockQuantity: 0,
      sku: ''
    }));
    
    onVariationsChange([...variations, ...newVariations]);
    toast.success(`${newVariations.length} variations générées`);
  };

  // Éditer une variation
  const handleEditVariation = (variation: ProductVariation) => {
    setEditingVariation(variation.id);
    setVariationForm(variation);
  };

  // Sauvegarder une variation
  const handleSaveVariation = () => {
    if (!editingVariation) return;
    
    const updatedVariations = variations.map(v => 
      v.id === editingVariation 
        ? { ...v, ...variationForm }
        : v
    );
    
    onVariationsChange(updatedVariations);
    setEditingVariation(null);
    setVariationForm({});
    toast.success('Variation mise à jour');
  };

  // Supprimer une variation
  const handleDeleteVariation = (variationId: string) => {
    if (confirm('Supprimer cette variation ?')) {
      onVariationsChange(variations.filter(v => v.id !== variationId));
      toast.success('Variation supprimée');
    }
  };

  return (
    <div className="space-y-6">
      {/* Gestion des Attributs */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attributs du Produit</CardTitle>
            <Button
              onClick={() => setIsAddingAttribute(true)}
              size="sm"
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Attribut
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulaire d'ajout d'attribut */}
          {isAddingAttribute && (
            <div className="p-4 border rounded-lg space-y-4" style={{
              borderColor: 'var(--notification-border, #e5e7eb)',
              backgroundColor: 'var(--app-background, #f9f9f9)'
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom de l'attribut</Label>
                  <Input
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Couleur, Taille..."
                  />
                </div>
                <div>
                  <Label>Valeurs (séparées par des virgules)</Label>
                  <Input
                    value={newAttribute.values}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, values: e.target.value }))}
                    placeholder="Ex: Rouge, Bleu, Vert"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="variation"
                  checked={newAttribute.variation}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, variation: e.target.checked }))}
                />
                <Label htmlFor="variation">Utilisé pour les variations</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddAttribute}>
                  <Save className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingAttribute(false);
                    setNewAttribute({ name: '', values: '', variation: true });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Liste des attributs */}
          {attributes.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--app-text, #666666)' }}>
              <p>Aucun attribut défini</p>
              <p className="text-sm">Ajoutez des attributs comme la couleur, la taille, etc.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{attribute.name}</span>
                      {attribute.variation && (
                        <Badge variant="outline" className="text-xs">
                          Variation
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {attribute.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAttribute(attribute.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestion des Variations */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variations du Produit</CardTitle>
            <Button
              onClick={generateVariations}
              size="sm"
              disabled={attributes.filter(attr => attr.variation).length === 0}
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Générer les Variations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variations.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--app-text, #666666)' }}>
              <p>Aucune variation créée</p>
              <p className="text-sm">Créez d'abord des attributs de variation, puis générez les combinaisons</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variations.map((variation) => (
                <div
                  key={variation.id}
                  className="border rounded-lg p-4"
                  style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
                >
                  {editingVariation === variation.id ? (
                    // Mode édition
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(variation.attributes).map(([attr, value]) => (
                          <Badge key={attr} variant="outline">
                            {attr}: {value}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Prix (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variationForm.price || 0}
                            onChange={(e) => setVariationForm(prev => ({ 
                              ...prev, 
                              price: parseFloat(e.target.value) || 0 
                            }))}
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variationForm.stockQuantity || 0}
                            onChange={(e) => setVariationForm(prev => ({ 
                              ...prev, 
                              stockQuantity: parseInt(e.target.value) || 0 
                            }))}
                          />
                        </div>
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variationForm.sku || ''}
                            onChange={(e) => setVariationForm(prev => ({ 
                              ...prev, 
                              sku: e.target.value 
                            }))}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveVariation}>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingVariation(null);
                            setVariationForm({});
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Object.entries(variation.attributes).map(([attr, value]) => (
                            <Badge key={attr} variant="outline">
                              {attr}: {value}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                          Prix: {variation.price}€ • Stock: {variation.stockQuantity}
                          {variation.sku && ` • SKU: ${variation.sku}`}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVariation(variation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVariation(variation.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

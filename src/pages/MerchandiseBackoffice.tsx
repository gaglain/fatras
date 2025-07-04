
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit, Settings, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  stockQuantity?: number;
  images?: string[];
  status: 'active' | 'inactive';
  tags?: string[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
}

interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: { [key: string]: string };
}

interface ProductFormProps {
  onSave: (product: Product) => void;
  onCancel: () => void;
  product?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, onCancel, product }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [costPrice, setCostPrice] = useState(product?.costPrice || 0);
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity || 0);
  const [status, setStatus] = useState<"active" | "inactive">(product?.status || "active");
  const [tags, setTags] = useState((product?.tags || []).join(', '));
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product?.attributes || []);
  const [variations, setVariations] = useState<ProductVariation[]>(product?.variations || []);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Nouvel attribut
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');

  // Nouvelle variation
  const [newVariationName, setNewVariationName] = useState('');
  const [newVariationPrice, setNewVariationPrice] = useState(0);
  const [newVariationStock, setNewVariationStock] = useState(0);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const tempUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, tempUrl]);
      toast.success('Image ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    if (!newAttributeName.trim() || !newAttributeValues.trim()) {
      toast.error('Nom et valeurs de l\'attribut requis');
      return;
    }

    const newAttribute: ProductAttribute = {
      id: Date.now().toString(),
      name: newAttributeName,
      values: newAttributeValues.split(',').map(v => v.trim())
    };

    setAttributes([...attributes, newAttribute]);
    setNewAttributeName('');
    setNewAttributeValues('');
    toast.success('Attribut ajouté');
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  const addVariation = () => {
    if (!newVariationName.trim()) {
      toast.error('Nom de la variation requis');
      return;
    }

    const newVariation: ProductVariation = {
      id: Date.now().toString(),
      name: newVariationName,
      price: newVariationPrice,
      stockQuantity: newVariationStock,
      attributes: {}
    };

    setVariations([...variations, newVariation]);
    setNewVariationName('');
    setNewVariationPrice(0);
    setNewVariationStock(0);
    toast.success('Variation ajoutée');
  };

  const removeVariation = (id: string) => {
    setVariations(variations.filter(variation => variation.id !== id));
  };

  const handleSubmit = () => {
    if (!name.trim() || price <= 0) {
      toast.error('Nom et prix requis');
      return;
    }

    const newProduct: Product = {
      id: product?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price.toString()),
      costPrice: parseFloat(costPrice.toString()) || 0,
      stockQuantity: parseInt(stockQuantity.toString()) || 0,
      status: status,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      images: images,
      attributes: attributes,
      variations: variations
    };

    onSave(newProduct);
  };

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du produit *</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="price">Prix *</Label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="Prix du produit"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du produit"
          className="mt-1"
        />
      </div>

      {/* Images */}
      <div>
        <Label>Images du produit</Label>
        <div className="mt-2 space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('imageInput')?.click()}
            disabled={uploadingImage}
            className="flex items-center space-x-2"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Ajouter une image</span>
          </Button>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-16 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 h-5 w-5 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attributs */}
      <div>
        <Label>Attributs (Couleur, Taille, etc.)</Label>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Nom (ex: Couleur)"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
            />
            <Input
              placeholder="Valeurs (Rouge, Bleu, Vert)"
              value={newAttributeValues}
              onChange={(e) => setNewAttributeValues(e.target.value)}
            />
            <Button type="button" onClick={addAttribute} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {attributes.map((attr) => (
            <div key={attr.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{attr.name}: </span>
                <span className="text-sm">{attr.values.join(', ')}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAttribute(attr.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Variations */}
      <div>
        <Label>Variations</Label>
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <Input
              placeholder="Nom variation"
              value={newVariationName}
              onChange={(e) => setNewVariationName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Prix"
              value={newVariationPrice}
              onChange={(e) => setNewVariationPrice(parseFloat(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Stock"
              value={newVariationStock}
              onChange={(e) => setNewVariationStock(parseInt(e.target.value))}
            />
            <Button type="button" onClick={addVariation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {variations.map((variation) => (
            <div key={variation.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{variation.name}</span>
                <span className="text-sm ml-2">({variation.price}€ - Stock: {variation.stockQuantity})</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeVariation(variation.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export const MerchandiseBackoffice: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      setProducts(updatedProducts);
      toast.success('Produit mis à jour');
    } else {
      setProducts([...products, product]);
      toast.success('Produit créé');
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Produit supprimé');
    }
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Boutique</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos produits avec attributs et variations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link to="/shop" target="_blank">
              <Package className="h-4 w-4 mr-2" />
              Voir la boutique
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catalogue Produits</CardTitle>
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showProductForm && (
            <div className="mb-6 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30">
              <h3 className="font-medium mb-4 text-blue-900">
                {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
              </h3>
              <ProductForm 
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                product={editingProduct || undefined}
              />
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
              <p className="text-gray-600 mb-4">Commencez par créer votre premier produit</p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Créer un produit
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-gray-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className={product.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{product.price}€</span>
                        <div className="text-sm text-gray-500">
                          Stock: {product.stockQuantity || 0}
                        </div>
                      </div>
                      {product.attributes && product.attributes.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {product.attributes.length} attribut(s) • {product.variations?.length || 0} variation(s)
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit, Settings, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ProductVariationManager } from '@/components/ProductVariationManager';

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
}

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

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'T-Shirt MusiConnect',
    description: 'T-shirt en coton bio avec le logo MusiConnect',
    price: 29.99,
    costPrice: 15.50,
    stockQuantity: 150,
    images: ['/tshirt.png'],
    status: 'active',
    tags: ['t-shirt', 'logo', 'coton bio']
  },
  {
    id: '2',
    name: 'Casquette Brodé',
    description: 'Casquette de baseball avec broderie MusiConnect',
    price: 24.99,
    costPrice: 12.00,
    stockQuantity: 80,
    images: ['/casquette.png'],
    status: 'active',
    tags: ['casquette', 'broderie', 'baseball']
  },
  {
    id: '3',
    name: 'Sticker Logo',
    description: 'Pack de 5 stickers avec différents logos MusiConnect',
    price: 4.99,
    costPrice: 1.00,
    stockQuantity: 500,
    images: ['/sticker.png'],
    status: 'active',
    tags: ['sticker', 'logo', 'pack']
  }
];

const defaultAttributes: ProductAttribute[] = [
  {
    id: 'attr-1',
    name: 'Couleur',
    values: ['Noir', 'Blanc', 'Gris'],
    variation: true
  },
  {
    id: 'attr-2',
    name: 'Taille',
    values: ['S', 'M', 'L', 'XL'],
    variation: true
  }
];

const defaultVariations: ProductVariation[] = [
  {
    id: 'var-1',
    attributes: { Couleur: 'Noir', Taille: 'M' },
    price: 34.99,
    stockQuantity: 20,
    sku: 'MC-TSHIRT-NOIR-M'
  },
  {
    id: 'var-2',
    attributes: { Couleur: 'Blanc', Taille: 'L' },
    price: 34.99,
    stockQuantity: 15,
    sku: 'MC-TSHIRT-BLANC-L'
  }
];

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

  const handleSubmit = () => {
    if (!name.trim() || price <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newProduct = {
      id: product?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price.toString()),
      costPrice: parseFloat(costPrice.toString()) || 0,
      stockQuantity: parseInt(stockQuantity.toString()) || 0,
      status: status,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    onSave(newProduct);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du produit *</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
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
          />
        </div>
        <div>
          <Label htmlFor="costPrice">Prix coûtant</Label>
          <Input
            type="number"
            id="costPrice"
            value={costPrice}
            onChange={(e) => setCostPrice(parseFloat(e.target.value))}
            placeholder="Prix coûtant"
          />
        </div>
        <div>
          <Label htmlFor="stockQuantity">Quantité en stock</Label>
          <Input
            type="number"
            id="stockQuantity"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(parseInt(e.target.value))}
            placeholder="Quantité en stock"
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
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags"
        />
      </div>
      <div>
        <Label>Statut</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            checked={status === "active"}
            onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
          />
          <Label htmlFor="active">Actif</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit}>
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export const MerchandiseBackoffice: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariations, setEditingVariations] = useState<Product | null>(null);
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>(defaultAttributes);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>(defaultVariations);

  const handleSaveProduct = (product: Product) => {
    if (product.id) {
      // Mise à jour d'un produit existant
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      setProducts(updatedProducts);
      toast.success('Produit mis à jour');
    } else {
      // Création d'un nouveau produit
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Boutique</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos produits, catégories et variations
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

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Produits</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Catégories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catalogue Produits</CardTitle>
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Produit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showProductForm && (
                <div className="mb-6 p-6 border-2 border-dashed border-blue-200 rounded-lg">
                  <ProductForm 
                    onSave={handleSaveProduct}
                    onCancel={() => setShowProductForm(false)}
                    product={editingProduct}
                  />
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
                  <p className="text-gray-600 mb-4">Commencez par créer votre premier produit</p>
                  <Button onClick={() => setShowProductForm(true)}>
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
                            <div>
                              <span className="text-2xl font-bold text-blue-600">{product.price}€</span>
                              {product.costPrice && (
                                <span className="text-sm text-gray-500 ml-2 line-through">
                                  {product.costPrice}€
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Stock: {product.stockQuantity || 0}
                            </div>
                          </div>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {product.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingVariations(product)}
                            className="flex-1"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Variations
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
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des Catégories</CardTitle>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Catégorie
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500">
                Fonctionnalité à venir...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Variation Manager Modal */}
      {editingVariations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Gestion des Variations - {editingVariations.name}
              </h2>
              <Button
                variant="outline"
                onClick={() => setEditingVariations(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ProductVariationManager
                attributes={productAttributes}
                variations={productVariations}
                onAttributesChange={setProductAttributes}
                onVariationsChange={setProductVariations}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

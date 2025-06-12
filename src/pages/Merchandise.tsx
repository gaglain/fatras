import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ShoppingCart, DollarSign, TrendingUp, Image, Upload, Settings } from 'lucide-react';

interface ProductVariation {
  id: string;
  size?: string;
  color?: string;
  gender?: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  variations: ProductVariation[];
  createdAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  basePrice: number;
  category: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'T-shirt Logo Band',
    description: 'T-shirt officiel avec logo du groupe',
    basePrice: 25.99,
    category: 'Vêtements',
    status: 'active',
    variations: [
      { id: '1a', size: 'S', color: 'Noir', gender: 'Unisexe', price: 25.99, stock: 10, sku: 'TSHIRT-S-NOIR' },
      { id: '1b', size: 'M', color: 'Noir', gender: 'Unisexe', price: 25.99, stock: 15, sku: 'TSHIRT-M-NOIR' },
      { id: '1c', size: 'L', color: 'Blanc', gender: 'Unisexe', price: 27.99, stock: 8, sku: 'TSHIRT-L-BLANC' }
    ],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Album Vinyle Collector',
    description: 'Edition limitée vinyle collector',
    basePrice: 35.00,
    category: 'Musique',
    status: 'active',
    variations: [
      { id: '2a', price: 35.00, stock: 20, sku: 'VINYL-COLLECTOR' }
    ],
    createdAt: '2024-01-10'
  }
];

export const Merchandise: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVariationsDialog, setShowVariationsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    basePrice: 0,
    category: '',
    status: 'active'
  });

  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    size: '',
    color: '',
    gender: '',
    price: 0,
    stock: 0,
    sku: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      category: '',
      status: 'active'
    });
  };

  const handleCreateProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...formData,
      variations: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProducts([...products, newProduct]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      category: product.category,
      status: product.status
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;
    
    const updatedProducts = products.map(product => 
      product.id === selectedProduct.id 
        ? { ...product, 
            name: formData.name,
            description: formData.description,
            basePrice: formData.basePrice,
            category: formData.category,
            status: formData.status
          }
        : product
    );
    
    setProducts(updatedProducts);
    setShowEditDialog(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const handleManageVariations = (product: Product) => {
    setSelectedProduct(product);
    setShowVariationsDialog(true);
  };

  const handleAddVariation = () => {
    if (!selectedProduct || !newVariation.sku) return;

    const variation: ProductVariation = {
      id: Date.now().toString(),
      size: newVariation.size || '',
      color: newVariation.color || '',
      gender: newVariation.gender || '',
      price: newVariation.price || selectedProduct.basePrice,
      stock: newVariation.stock || 0,
      sku: newVariation.sku
    };

    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id
        ? { ...product, variations: [...product.variations, variation] }
        : product
    );

    setProducts(updatedProducts);
    setNewVariation({ size: '', color: '', gender: '', price: 0, stock: 0, sku: '' });
  };

  const handleDeleteVariation = (variationId: string) => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id
        ? { ...product, variations: product.variations.filter(v => v.id !== variationId) }
        : product
    );

    setProducts(updatedProducts);
    const updatedProduct = updatedProducts.find(p => p.id === selectedProduct.id);
    if (updatedProduct) {
      setSelectedProduct(updatedProduct);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'out_of_stock': return 'Rupture de stock';
      default: return status;
    }
  };

  const totalStock = products.reduce((sum, product) => 
    sum + product.variations.reduce((varSum, variation) => varSum + variation.stock, 0), 0
  );

  const activeProducts = products.filter(product => product.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchandising</h1>
          <p className="text-gray-600 mt-2">Gérez vos produits dérivés et articles de merchandise</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du produit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vêtements">Vêtements</SelectItem>
                      <SelectItem value="Accessoires">Accessoires</SelectItem>
                      <SelectItem value="Musique">Musique</SelectItem>
                      <SelectItem value="Posters">Posters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix de base (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateProduct}>
                  Créer le produit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus Estimés</p>
                <p className="text-2xl font-bold text-gray-900">Calculer...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="variations">Gestion des Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Catalogue de Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium text-green-600">{product.basePrice}€</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{product.variations.length} variations</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleManageVariations(product)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion Globale des Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">{product.name}</h3>
                    <div className="space-y-2">
                      {product.variations.map((variation) => (
                        <div key={variation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium">{variation.sku}</span>
                            <span className="text-sm text-gray-600">
                              {variation.size && `Taille: ${variation.size}`}
                              {variation.color && ` • Couleur: ${variation.color}`}
                              {variation.gender && ` • ${variation.gender}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{variation.price}€</span>
                            <span className="text-sm text-gray-500">Stock: {variation.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variations Management Dialog */}
      <Dialog open={showVariationsDialog} onOpenChange={setShowVariationsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gérer les variations - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add New Variation */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Ajouter une variation</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Taille (S, M, L...)"
                  value={newVariation.size}
                  onChange={(e) => setNewVariation({ ...newVariation, size: e.target.value })}
                />
                <Input
                  placeholder="Couleur"
                  value={newVariation.color}
                  onChange={(e) => setNewVariation({ ...newVariation, color: e.target.value })}
                />
                <Select value={newVariation.gender} onValueChange={(value) => setNewVariation({ ...newVariation, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                    <SelectItem value="Unisexe">Unisexe</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Prix"
                  value={newVariation.price}
                  onChange={(e) => setNewVariation({ ...newVariation, price: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={newVariation.stock}
                  onChange={(e) => setNewVariation({ ...newVariation, stock: parseInt(e.target.value) || 0 })}
                />
                <Input
                  placeholder="SKU (obligatoire)"
                  value={newVariation.sku}
                  onChange={(e) => setNewVariation({ ...newVariation, sku: e.target.value })}
                />
              </div>
              <Button onClick={handleAddVariation} className="mt-3">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {/* Existing Variations */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedProduct?.variations.map((variation) => (
                <div key={variation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{variation.sku}</div>
                    <div className="text-sm text-gray-600">
                      {variation.size && `Taille: ${variation.size}`}
                      {variation.color && ` • Couleur: ${variation.color}`}
                      {variation.gender && ` • ${variation.gender}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{variation.price}€</div>
                      <div className="text-sm text-gray-500">Stock: {variation.stock}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteVariation(variation.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du produit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vêtements">Vêtements</SelectItem>
                    <SelectItem value="Accessoires">Accessoires</SelectItem>
                    <SelectItem value="Musique">Musique</SelectItem>
                    <SelectItem value="Posters">Posters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateProduct}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

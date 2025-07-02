
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Eye,
  Settings
} from 'lucide-react';
import { Shop } from '@/components/Shop';
import { ProductForm } from '@/components/ProductForm';
import { toast } from 'sonner';

const mockProducts = [
  {
    id: 1,
    name: 'T-shirt Concert Tour 2024',
    price: 25.99,
    stockQuantity: 150,
    category: 'Vêtements',
    status: 'active',
    sales: 89,
    description: 'T-shirt officiel de la tournée 2024',
    images: ['/placeholder.svg'],
    variations: []
  }
];

export const MerchandiseBackoffice: React.FC = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'low_stock': return 'Stock faible';
      case 'out_of_stock': return 'Rupture';
      default: return 'Inconnu';
    }
  };

  const handleSaveProduct = (productData: any) => {
    if (selectedProduct) {
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...productData, id: selectedProduct.id } : p));
      toast.success('Produit modifié avec succès');
    } else {
      setProducts(prev => [...prev, { ...productData, id: Date.now() }]);
      toast.success('Produit créé avec succès');
    }
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Produit supprimé');
    }
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Gestion Merchandise
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Gérez vos produits et visualisez la boutique publique
          </p>
        </div>
        <Button 
          onClick={handleNewProduct}
          style={{
            backgroundColor: 'var(--app-button-bg, #1632f4)',
            color: 'var(--app-button-text, #ffffff)'
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">
            <Settings className="h-4 w-4 mr-2" />
            Gestion
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Aperçu Boutique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Produits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
                  <div>
                    <p className="text-2xl font-bold">0€</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Revenus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Ventes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0)}</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Stock Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Management */}
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                  Gestion des Produits
                </CardTitle>
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  style={{
                    color: 'var(--app-text, #18181b)',
                    borderColor: 'var(--notification-border, #e5e7eb)'
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
                    <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
                    <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
                      Commencez par créer votre premier produit
                    </p>
                    <Button onClick={handleNewProduct} style={{
                      backgroundColor: 'var(--app-button-bg, #1632f4)',
                      color: 'var(--app-button-text, #ffffff)'
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un produit
                    </Button>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg" style={{
                      borderColor: 'var(--notification-border, #e5e7eb)'
                    }}>
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: 'var(--app-card-text, #18181b)' }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                          <span>Prix: {product.price}€</span>
                          <span>Stock: {product.stockQuantity}</span>
                          <span>Ventes: {product.sales}</span>
                          <Badge className={getStatusColor(product.status)}>
                            {getStatusLabel(product.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                          style={{
                            color: 'var(--app-button-bg, #1632f4)',
                            borderColor: 'var(--app-button-bg, #1632f4)'
                          }}
                        >
                          <Edit className="h-4 w-4" />
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Aperçu de la Boutique Publique
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Voici comment vos clients voient la boutique
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4" style={{
                borderColor: 'var(--notification-border, #e5e7eb)',
                backgroundColor: 'var(--app-background, #ffffff)'
              }}>
                <Shop />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour le formulaire produit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProductForm
            product={selectedProduct}
            onSave={handleSaveProduct}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

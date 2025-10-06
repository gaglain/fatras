import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/ProductForm';
import { toast } from 'sonner';

export const MerchandiseBackoffice: React.FC = () => {
  const { products, loading, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(id);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <ProductForm 
          product={editingProduct}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion Merchandise</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre catalogue de produits ({products.length} produits)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
            <p className="text-muted-foreground mb-4">Créez votre premier produit</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description || 'Aucune description'}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-lg font-bold">{product.price} €</p>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};